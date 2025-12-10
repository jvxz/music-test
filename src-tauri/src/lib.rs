use anyhow::Context;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
use serde::Serialize;
use std::sync::Arc;
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  AppHandle, Manager, Runtime, WebviewUrl, WebviewWindowBuilder,
};

use crate::files::read::FileEntry;

mod files {
  pub mod read;
}
mod cover_protocol;
mod playback;
mod waveform;

#[taurpc::procedures(export_to = "../app/utils/tauri-bindings.ts")]
trait Api {
  async fn read_folder(path: String) -> Result<Arc<Vec<FileEntry>>, String>;
  async fn play_track(path: String) -> Result<(), String>;
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
  async fn get_waveform<R: Runtime>(
    self,
    app_handle: AppHandle<R>,
    path: String,
    bin_size: f32,
  ) -> Result<Vec<f32>, String> {
    return waveform::get_waveform(app_handle, path, bin_size).await;
  }
  async fn play_track(self, path: String) -> Result<(), String> {
    return playback::play_track(path).await;
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

      let stream_handle = rodio::OutputStreamBuilder::open_default_stream()
        .context("Failed to open default audio stream")?;
      let sink = rodio::Sink::connect_new(stream_handle.mixer());

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
