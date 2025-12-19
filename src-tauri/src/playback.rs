use anyhow::Result;
use serde::{Deserialize, Serialize};
use specta::Type;
use tauri::{AppHandle, Manager, Runtime};
use tokio::sync::{mpsc, oneshot};

pub struct AudioHandle {
  pub tx: mpsc::Sender<(StreamAction, oneshot::Sender<StreamStatus>)>,
}

#[derive(Serialize, Clone, Deserialize, Type, Debug)]
pub enum StreamAction {
  Play(String),
  Pause,
  Resume,
  Seek(f64),
  SetLoop(bool),
  SetVolume(f32),
  ToggleMute,
}

#[derive(Serialize, Clone, Deserialize, Type, Debug)]
pub struct StreamStatus {
  pub is_playing: bool,
  pub position: f64,
  pub duration: f64,
  pub is_looping: bool,
  pub path: Option<String>,
  pub volume: f32,
  pub is_muted: bool,
}

#[tauri::command]
pub async fn control_playback<R: Runtime>(
  app_handle: AppHandle<R>,
  action: StreamAction,
) -> Result<StreamStatus, String> {
  let audio_handle = app_handle.state::<AudioHandle>();

  let (response_tx, response_rx) = oneshot::channel::<StreamStatus>();

  audio_handle.tx.send((action, response_tx)).await;

  let response = response_rx
    .await
    .map_err(|_| "failed to get response from audio thread".to_string())?;

  return Ok(response);
}
