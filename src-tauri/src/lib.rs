#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  TitleBarStyle, WebviewUrl, WebviewWindowBuilder,
};

use crate::files::read::FileEntry;

mod files {
  pub mod read;
}

#[taurpc::procedures(export_to = "../app/tauri-bindings.ts")]
trait Api {
  async fn read_folder(path: String) -> Vec<FileEntry>;
}

#[taurpc::resolvers]
impl Api for ApiImpl {
  async fn read_folder(self, path: String) -> Vec<FileEntry> {
    return files::read::read_folder(path).await;
  }
}

#[derive(Clone)]
struct ApiImpl;

#[tokio::main]
pub async fn run() {
  tauri::Builder::default()
    .setup(|app| {
      let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("Music Test")
        .inner_size(800.0, 600.0)
        .focused(false);

      // set transparent title bar only when building for macOS
      #[cfg(target_os = "macos")]
      let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);

      let window = win_builder.build().unwrap();

      // set background color and prevent focus stealing on macOS
      #[cfg(target_os = "macos")]
      {
        use cocoa::appkit::{NSColor, NSWindow};
        use cocoa::base::{id, nil};

        let ns_window = window.ns_window().unwrap() as id;
        unsafe {
          let bg_color = NSColor::colorWithRed_green_blue_alpha_(
            nil,
            0.0 / 255.0,
            0.0 / 255.0,
            0.0 / 255.0,
            1.0,
          );
          ns_window.setBackgroundColor_(bg_color);
        }
      }

      let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&quit_i])?;

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
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_store::Builder::new().build())
    .invoke_handler(taurpc::create_ipc_handler(ApiImpl.into_handler()))
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
