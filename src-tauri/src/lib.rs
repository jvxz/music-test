#[cfg_attr(mobile, tauri::mobile_entry_point)]
use crate::error::{Error, Result};
use crate::playback::{AudioHandle, StreamAction, StreamStatus};
use rand::TryRngCore;
use std::io::Write;
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  AppHandle, LogicalPosition, Manager, Position, Runtime, WebviewUrl, WebviewWindowBuilder,
};
use tauri_plugin_sql::{Migration, MigrationKind};
use tauri_plugin_store::StoreExt;
use tauri_plugin_window_state::StateFlags;
use tauri_specta::collect_commands;
use tokio::sync::{mpsc, oneshot};

mod audio;
mod cover_protocol;
mod error;
mod hooks;
mod id3;
mod lastfm;
mod playback;
mod read;
mod stronghold;
mod waveform;

#[tokio::main]
#[allow(clippy::expect_used, clippy::unwrap_used)]
pub async fn run() {
  #[cfg(debug_assertions)] // only enable instrumentation in development builds
  let devtools = tauri_plugin_devtools::init();

  let migrations: Vec<Migration> = vec![
    Migration {
      kind: MigrationKind::Up,
      description: "create playlists table",
      sql: "
          CREATE TABLE playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            name TEXT NOT NULL, 
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        ",
      version: 1,
    },
    Migration {
      kind: MigrationKind::Up,
      description: "create library_tracks table",
      sql: "
          CREATE TABLE library_tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL UNIQUE,
            filename TEXT NOT NULL,
            title TEXT,
            artist TEXT,
            album TEXT
          );
        ",
      version: 2,
    },
    Migration {
      kind: MigrationKind::Up,
      description: "create library_folders table",
      sql: "
          CREATE TABLE library_folders (
            path TEXT NOT NULL,
            recursive BOOLEAN NOT NULL DEFAULT FALSE,
            last_scanned DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (path)
          );
        ",
      version: 3,
    },
    Migration {
      kind: MigrationKind::Up,
      description: "create playlist_tracks table",
      sql: "
          CREATE TABLE playlist_tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            track_id INTEGER NOT NULL,
            playlist_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            position INTEGER NOT NULL,
            FOREIGN KEY (track_id) REFERENCES library_tracks(id) ON DELETE CASCADE,
            FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
          );
        ",
      version: 4,
    },
    Migration {
      kind: MigrationKind::Up,
      description: "create library_tracks_source table",
      sql: "
          CREATE TABLE library_tracks_source (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            track_id INTEGER NOT NULL REFERENCES library_tracks(id) ON DELETE CASCADE,
            source_type TEXT NOT NULL,
            source_id TEXT NOT NULL,
            UNIQUE (track_id, source_type, source_id)
          );
        ",
      version: 5,
    },
    Migration {
      kind: MigrationKind::Up,
      description: "create reorder_after_delete trigger",
      sql: "
          CREATE TRIGGER reorder_after_delete 
          AFTER DELETE ON playlist_tracks
          BEGIN
            UPDATE playlist_tracks 
            SET position = position - 1 
            WHERE playlist_id = OLD.playlist_id AND position > OLD.position;
          END;
    ",
      version: 6,
    },
    Migration {
      kind: MigrationKind::Up,
      description: "create cleanup_playlist_track_source trigger",
      sql: "
          CREATE TRIGGER cleanup_playlist_track_source
          AFTER DELETE ON playlist_tracks
          FOR EACH ROW
          BEGIN
            DELETE FROM library_tracks_source
            WHERE source_type = 'playlist'
              AND source_id = OLD.playlist_id
              AND track_id = OLD.track_id;
          END;
    ",
      version: 7,
    },
    Migration {
      kind: MigrationKind::Up,
      description: "create remove_orphaned_library_track trigger",
      sql: "
          CREATE TRIGGER remove_orphaned_library_track
          AFTER DELETE ON library_tracks_source
          FOR EACH ROW
          WHEN NOT EXISTS (
            SELECT 1 FROM library_tracks_source WHERE track_id = OLD.track_id
          )
          BEGIN
            DELETE FROM library_tracks WHERE id = OLD.track_id;
          END;
    ",
      version: 8,
    },
  ];

  let rpc_builder = tauri_specta::Builder::<tauri::Wry>::new().commands(collect_commands![
    read::read_folder,
    read::get_canonical_path,
    read::get_track_data,
    read::get_tracks_data,
    read::get_folder_track_paths,
    playback::control_playback,
    waveform::get_waveform,
    lastfm::open_lastfm_auth,
    lastfm::complete_lastfm_auth,
    lastfm::remove_lastfm_account,
    lastfm::scrobble_track,
    lastfm::process_offline_scrobbles,
    lastfm::set_now_playing,
    lastfm::get_lastfm_auth_status,
    lastfm::get_lastfm_profile,
    id3::write_id3_frames,
  ]);

  #[cfg(debug_assertions)]
  {
    rpc_builder
      .export(
        specta_typescript::Typescript::default(),
        "../app/types/tauri-bindings.ts",
      )
      .expect("Failed to export typescript bindings");
  }

  let mut builder = tauri::Builder::default()
    .invoke_handler(rpc_builder.invoke_handler())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(
      tauri_plugin_window_state::Builder::default()
        // don't save visible state, messes up manual visible states
        .with_state_flags(StateFlags::all() & !StateFlags::VISIBLE)
        .with_filter(|label| label.contains("main"))
        .build(),
    )
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:swim.db", migrations)
        .build(),
    );

  #[cfg(debug_assertions)]
  {
    builder = builder.plugin(devtools);
  }

  return builder
    .setup(|app| {
      let mut win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("swim")
        .inner_size(800.0, 600.0)
        .decorations(true);

      #[cfg(target_os = "macos")]
      {
        win_builder = win_builder
          .traffic_light_position(Position::Logical(LogicalPosition::new(8.0, 8.0)))
          .title_bar_style(tauri::TitleBarStyle::Overlay);
      }

      let cache_dir = app
        .app_handle()
        .path()
        .app_cache_dir()
        .map_err(|e| Error::Backend(format!("Could not resolve app cache directory: {}", e)))?;
      std::fs::create_dir_all(&cache_dir)
        .map_err(|e| Error::Backend(format!("Failed to create cache directory: {}", e)))?;

      win_builder
        .build()
        .map_err(|e| Error::Backend(format!("Failed to build window: {}", e)))?;

      let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&quit_i])?;

      // setup audio stuff
      let (tx, rx) = mpsc::channel::<(StreamAction, oneshot::Sender<StreamStatus>)>(32);
      app.manage(AudioHandle { tx });

      let initial_state = get_initial_state(app.app_handle())?;
      let audio_thread_app_handle = app.app_handle().clone();
      let _ = std::thread::spawn(move || {
        if let Err(e) = audio::spawn_audio_thread(rx, initial_state, audio_thread_app_handle) {
          // log::error!("Failed to spawn audio thread: {e}");
          println!("Failed to spawn audio thread: {e}");
        }
      });

      // stronghold
      let salt_path = app
        .path()
        .app_local_data_dir()
        .map_err(|e| Error::Backend(format!("Could not resolve app local data path: {}", e)))?
        .join("salt.txt");

      if let Some(parent_dir) = salt_path.parent() {
        std::fs::create_dir_all(parent_dir)
          .map_err(|e| Error::Backend(format!("Failed to create parent directory: {}", e)))?;
      }

      if !salt_path.exists() {
        let mut salt = [0u8; 32];
        rand::rng().try_fill_bytes(&mut salt).map_err(|e| {
          Error::Backend(format!(
            "Failed to fill bytes when creating salt file: {}",
            e
          ))
        })?;
        let mut file = std::fs::File::create(&salt_path)
          .map_err(|e| Error::Backend(format!("Failed to create salt file: {}", e)))?;
        file
          .write_all(&salt)
          .map_err(|e| Error::Backend(format!("Failed to write salt to file: {}", e)))?;
      }

      app
        .handle()
        .plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;

      let default_window_icon = app
        .default_window_icon()
        .ok_or_else(|| Error::Backend("Failed to get default window icon".to_string()))?;
      let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(true)
        .icon(default_window_icon.clone())
        .on_menu_event(|app, event| match event.id.as_ref() {
          "quit" => {
            app.exit(0);
          }
          other => {
            println!("menu item {} not handled", other);
          }
        })
        .build(app)?;

      Ok(())
    })
    .register_asynchronous_uri_scheme_protocol("cover-full", |ctx, req, responder| {
      cover_protocol::handler(ctx, req, responder, cover_protocol::CoverMode::Full)
    })
    .register_asynchronous_uri_scheme_protocol("cover-thumbnail", |ctx, req, responder| {
      cover_protocol::handler(ctx, req, responder, cover_protocol::CoverMode::Thumbnail)
    })
    .plugin(tauri_plugin_pinia::init())
    .plugin(tauri_plugin_system_fonts::init())
    .plugin(tauri_plugin_drag::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_store::Builder::new().build())
    .on_window_event(hooks::window_event::handle_window_event)
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn get_initial_state<R: Runtime>(app_handle: &AppHandle<R>) -> Result<Option<StreamStatus>> {
  let initial_state = match app_handle.store("prefs.json") {
    Ok(store) => store,
    Err(_) => return Ok(None),
  };
  let initial_state = initial_state.get("playback-status").unwrap_or_default();
  let initial_state: StreamStatus = serde_json::from_value(initial_state)
    .map_err(|_| Error::Store("failed to deserialize initial state".to_string()))?;

  return Ok(Some(initial_state));
}
