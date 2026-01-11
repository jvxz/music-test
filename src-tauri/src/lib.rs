// #![deny(clippy::unwrap_used, clippy::expect_used)]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
use crate::error::{Error, Result};
use crate::lastfm::{SerializedOfflineScrobble, SerializedScrobble, SerializedScrobbleResponse};
use crate::playback::{AudioHandle, StreamAction, StreamStatus};
use crate::read::FileEntry;
use rand::TryRngCore;
use serde::Serialize;
use std::io::Write;
use std::sync::Arc;
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  AppHandle, LogicalPosition, Manager, Position, Runtime, WebviewUrl, WebviewWindowBuilder,
};
use tauri_plugin_sql::{Migration, MigrationKind};
use tauri_plugin_store::StoreExt;
use tauri_plugin_stronghold::stronghold::Stronghold;
use tokio::sync::{mpsc, oneshot};
use uuid::Uuid;

mod audio;
mod cover_protocol;
mod error;
mod hooks;
mod lastfm;
mod playback;
mod read;
mod waveform;

#[taurpc::procedures(export_to = "../app/utils/tauri-bindings.ts")]
trait Api {
  async fn read_folder(path: String) -> Result<Arc<Vec<FileEntry>>>;
  async fn get_canonical_path(path: String) -> Result<String>;
  async fn get_track_data(path: String) -> Result<FileEntry>;
  async fn get_tracks_data(paths: Vec<String>) -> Vec<FileEntry>;
  async fn control_playback<R: Runtime>(
    app_handle: AppHandle<R>,
    action: StreamAction,
  ) -> Result<StreamStatus>;

  async fn get_waveform<R: Runtime>(
    app_handle: AppHandle<R>,
    path: String,
    bin_size: f32,
  ) -> Result<Vec<f32>>;

  // lastfm
  async fn open_lastfm_auth<R: Runtime>(app_handle: AppHandle<R>) -> Result<String>;
  async fn complete_lastfm_auth<R: Runtime>(
    app_handle: AppHandle<R>,
    token: String,
  ) -> Result<String>;
  async fn remove_lastfm_account<R: Runtime>(app_handle: AppHandle<R>) -> Result<()>;
  async fn scrobble_track<R: Runtime>(
    app_handle: AppHandle<R>,
    scrobble: SerializedScrobble,
  ) -> Result<SerializedScrobbleResponse>;
  async fn process_offline_scrobbles<R: Runtime>(
    app_handle: AppHandle<R>,
    scrobbles: Vec<SerializedOfflineScrobble>,
  ) -> Result<SerializedScrobbleResponse>;
  async fn set_now_playing<R: Runtime>(
    app_handle: AppHandle<R>,
    scrobble: SerializedScrobble,
  ) -> Result<()>;
  async fn get_lastfm_auth_status<R: Runtime>(app_handle: AppHandle<R>) -> Result<bool>;
}

#[taurpc::resolvers]
impl Api for ApiImpl {
  async fn read_folder(self, path: String) -> Result<Arc<Vec<FileEntry>>> {
    return read::read_folder(path).await;
  }

  async fn get_canonical_path(self, path: String) -> Result<String> {
    let canonical_path = std::fs::canonicalize(path)
      .map(|p| p.to_string_lossy().to_string())
      .map_err(|e| Error::Other(e.to_string()))?;

    return Ok(canonical_path);
  }

  async fn get_track_data(self, path: String) -> Result<FileEntry> {
    return read::get_track_data(path).await;
  }

  async fn get_tracks_data(self, paths: Vec<String>) -> Vec<FileEntry> {
    return read::get_tracks_data(paths).await;
  }

  async fn get_waveform<R: Runtime>(
    self,
    app_handle: AppHandle<R>,
    path: String,
    bin_size: f32,
  ) -> Result<Vec<f32>> {
    return waveform::get_waveform(app_handle, path, bin_size).await;
  }

  async fn control_playback<R: Runtime>(
    self,
    app_handle: AppHandle<R>,
    action: StreamAction,
  ) -> Result<StreamStatus> {
    return playback::control_playback(app_handle, action).await;
  }

  // lastfm
  async fn open_lastfm_auth<R: Runtime>(self, app_handle: AppHandle<R>) -> Result<String> {
    return lastfm::open_lastfm_auth(app_handle).await;
  }

  async fn complete_lastfm_auth<R: Runtime>(
    self,
    app_handle: AppHandle<R>,
    token: String,
  ) -> Result<String> {
    return lastfm::complete_lastfm_auth(app_handle, token).await;
  }

  async fn remove_lastfm_account<R: Runtime>(self, app_handle: AppHandle<R>) -> Result<()> {
    return lastfm::remove_lastfm_account(app_handle).await;
  }

  async fn scrobble_track<R: Runtime>(
    self,
    app_handle: AppHandle<R>,
    scrobble: SerializedScrobble,
  ) -> Result<SerializedScrobbleResponse> {
    return lastfm::scrobble_track(app_handle, scrobble).await;
  }

  async fn process_offline_scrobbles<R: Runtime>(
    self,
    app_handle: AppHandle<R>,
    scrobbles: Vec<SerializedOfflineScrobble>,
  ) -> Result<SerializedScrobbleResponse> {
    return lastfm::process_offline_scrobbles(app_handle, scrobbles).await;
  }

  async fn set_now_playing<R: Runtime>(
    self,
    app_handle: AppHandle<R>,
    scrobble: SerializedScrobble,
  ) -> Result<()> {
    return lastfm::set_now_playing(app_handle, scrobble).await;
  }

  async fn get_lastfm_auth_status<R: Runtime>(self, app_handle: AppHandle<R>) -> Result<bool> {
    return lastfm::get_lastfm_auth_status(app_handle).await;
  }
}

#[derive(Clone, Serialize)]
pub struct ApiImpl;

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
            FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
            UNIQUE (position)
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

  let mut builder = tauri::Builder::default()
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:swim.db", migrations)
        .build(),
    )
    .plugin(tauri_plugin_window_state::Builder::new().build());

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

      let cache_dir = app.app_handle().path().app_cache_dir().unwrap();
      std::fs::create_dir_all(&cache_dir).unwrap();

      win_builder.build().unwrap();

      let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&quit_i])?;

      // setup audio stuff
      let (tx, rx) = mpsc::channel::<(StreamAction, oneshot::Sender<StreamStatus>)>(32);
      app.manage(AudioHandle { tx });

      let initial_state = get_initial_state(app.app_handle())?;
      let _join_handle = std::thread::spawn(move || {
        if let Err(e) = audio::spawn_audio_thread(rx, initial_state) {
          log::error!("failed to spawn audio thread: {e}");
        }
      });

      // stronghold
      let salt_path = app
        .path()
        .app_local_data_dir()
        .expect("could not resolve app local data path")
        .join("salt.txt");

      if let Some(parent_dir) = salt_path.parent() {
        std::fs::create_dir_all(parent_dir).unwrap();
      }

      if !salt_path.exists() {
        let mut salt = [0u8; 32];
        rand::rng().try_fill_bytes(&mut salt).unwrap();
        let mut file = std::fs::File::create(&salt_path).unwrap();
        file.write_all(&salt).unwrap();
      }

      app
        .handle()
        .plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;

      let vault_entry = keyring::Entry::new("swim", "master-key").unwrap();

      let vault_pw = match vault_entry.get_password() {
        Ok(pw) => pw,
        Err(_) => {
          let new_pw = Uuid::new_v4().simple().to_string();
          vault_entry
            .set_password(new_pw.as_str())
            .map_err(|e| Error::Stronghold(e.to_string()))?;
          new_pw
        }
      };

      let stronghold_path = app
        .path()
        .app_local_data_dir()
        .expect("failed to get app local data dir")
        .join("swim.hold");
      let stronghold = Stronghold::new(stronghold_path, vault_pw.as_bytes().to_vec())
        .expect("failed to create stronghold");
      app.manage(stronghold);

      let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(true)
        .icon(app.default_window_icon().unwrap().clone())
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
    .plugin(tauri_plugin_system_fonts::init())
    .plugin(tauri_plugin_drag::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_store::Builder::new().build())
    .invoke_handler(taurpc::create_ipc_handler(ApiImpl.into_handler()))
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
