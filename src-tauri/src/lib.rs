#[cfg_attr(mobile, tauri::mobile_entry_point)]
use serde::Serialize;
use std::sync::Arc;
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  AppHandle, Manager, Runtime, WebviewUrl, WebviewWindowBuilder,
};
use tokio::sync::{mpsc, oneshot};

use crate::files::read::FileEntry;
use crate::playback::{AudioHandle, StreamAction, StreamStatus};

mod files {
  pub mod read;
}
mod audio;
mod cover_protocol;
mod playback;
mod waveform;

#[taurpc::procedures(export_to = "../app/utils/tauri-bindings.ts")]
trait Api {
  async fn read_folder(path: String) -> Result<Arc<Vec<FileEntry>>, String>;
  async fn get_track_data(path: String) -> Result<Option<FileEntry>, String>;
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

  async fn get_track_data(self, path: String) -> Result<Option<FileEntry>, String> {
    return files::read::get_track_data(path).await;
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

  let mut builder = tauri::Builder::default();

  #[cfg(debug_assertions)]
  {
    builder = builder.plugin(devtools);
  }

  return builder
    .setup(|app| {
      let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("swim")
        .inner_size(800.0, 600.0)
        .focused(false);

      let cache_dir = app.app_handle().path().app_cache_dir().unwrap();
      std::fs::create_dir_all(&cache_dir).unwrap();

      win_builder.build().unwrap();

      let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&quit_i])?;

      // setup audio stuff
      let (tx, rx) = mpsc::channel::<(StreamAction, oneshot::Sender<StreamStatus>)>(32);
      app.manage(AudioHandle { tx });
      std::thread::spawn(move || audio::spawn_audio_thread(rx));

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
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_store::Builder::new().build())
    .invoke_handler(taurpc::create_ipc_handler(ApiImpl.into_handler()))
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
