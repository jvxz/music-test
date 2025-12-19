use tauri::{Window, WindowEvent};
use tauri_plugin_store::StoreExt;

use crate::playback::StreamStatus;

pub fn handle_window_event(window: &Window, event: &WindowEvent) {
  if let WindowEvent::CloseRequested { .. } = event {
    if let Ok(store) = window.store("prefs.json") {
      let playback_status = store.get("playback-status").unwrap_or_default();
      let mut playback_status: StreamStatus = serde_json::from_value(playback_status).unwrap();

      playback_status.is_playing = false;

      store.set(
        "playback-status",
        serde_json::to_value(playback_status).unwrap(),
      );
    }
  }
}
