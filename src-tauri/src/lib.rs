use crate::files::read::{FileEntry, SortMethod};
use crate::playback::{AudioHandle, StreamAction, StreamStatus};
#[cfg_attr(mobile, tauri::mobile_entry_point)]
use serde::Serialize;
use std::sync::Arc;
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  AppHandle, LogicalPosition, Manager, Position, Runtime, WebviewUrl, WebviewWindowBuilder,
};
use tauri_plugin_sql::{Migration, MigrationKind};
use tauri_plugin_store::StoreExt;
use tokio::sync::{mpsc, oneshot};

mod files {
  pub mod read;
}
mod audio;
mod cover_protocol;
mod hooks;
mod playback;
mod waveform;

#[taurpc::procedures(export_to = "../app/utils/tauri-bindings.ts")]
trait Api {
  async fn read_folder(path: String) -> Result<Arc<Vec<FileEntry>>, String>;
  async fn get_canonical_path(path: String) -> Result<String, String>;
  async fn get_track_data(path: String) -> Option<FileEntry>;
  async fn get_tracks_data(paths: Vec<String>) -> Vec<FileEntry>;
  async fn control_playback<R: Runtime>(
    app_handle: AppHandle<R>,
    action: StreamAction,
  ) -> Result<StreamStatus, String>;

  async fn get_waveform<R: Runtime>(
    app_handle: AppHandle<R>,
    path: String,
    bin_size: f32,
  ) -> Result<Vec<f32>, String>;
}

#[taurpc::resolvers]
impl Api for ApiImpl {
  async fn read_folder(self, path: String) -> Result<Arc<Vec<FileEntry>>, String> {
    return files::read::read_folder(path).await;
  }

  async fn get_canonical_path(self, path: String) -> Result<String, String> {
    return std::fs::canonicalize(path)
      .map(|p| p.to_string_lossy().to_string())
      .map_err(|e| e.to_string());
  }

  async fn get_track_data(self, path: String) -> Option<FileEntry> {
    return files::read::get_track_data(path).await;
  }

  async fn get_tracks_data(self, paths: Vec<String>) -> Vec<FileEntry> {
    return files::read::get_tracks_data(paths).await;
  }

  async fn get_waveform<R: Runtime>(
    self,
    app_handle: AppHandle<R>,
    path: String,
    bin_size: f32,
  ) -> Result<Vec<f32>, String> {
    return waveform::get_waveform(app_handle, path, bin_size).await;
  }

  async fn control_playback<R: Runtime>(
    self,
    app_handle: AppHandle<R>,
    action: StreamAction,
  ) -> Result<StreamStatus, String> {
    return playback::control_playback(app_handle, action).await;
  }
}

#[derive(Clone, Serialize)]
pub struct ApiImpl;

#[tokio::main]
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
      description: "create playlist_tracks table",
      sql: "
          CREATE TABLE playlist_tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            playlist_id INTEGER NOT NULL,
            FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
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
      description: "create library_tracks table",
      sql: "
          CREATE TABLE library_tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL UNIQUE,
            filename TEXT NOT NULL,
            title TEXT,
            artist TEXT
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
  ];

  let mut builder = tauri::Builder::default()
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
      let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("swim")
        .inner_size(800.0, 600.0)
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .decorations(true)
        .traffic_light_position(Position::Logical(LogicalPosition::new(8.0, 8.0)));

      let cache_dir = app.app_handle().path().app_cache_dir().unwrap();
      std::fs::create_dir_all(&cache_dir).unwrap();

      win_builder.build().unwrap();

      let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&quit_i])?;

      // setup audio stuff
      let (tx, rx) = mpsc::channel::<(StreamAction, oneshot::Sender<StreamStatus>)>(32);
      app.manage(AudioHandle { tx });

      let initial_state = get_initial_state(app.app_handle());
      let _join_handle = std::thread::spawn(move || audio::spawn_audio_thread(rx, initial_state));

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

fn get_initial_state<R: Runtime>(app_handle: &AppHandle<R>) -> Option<StreamStatus> {
  let initial_state = match app_handle.store("prefs.json") {
    Ok(store) => store,
    Err(_) => return None,
  };
  let initial_state = initial_state.get("playback-status").unwrap_or_default();
  let initial_state: StreamStatus = serde_json::from_value(initial_state).unwrap();
  return Some(initial_state);
}
