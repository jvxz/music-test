use crate::playback::{StreamAction, StreamStatus};
use kira::sound::streaming::StreamingSoundHandle;
use kira::sound::FromFileError;
use kira::{
  self, sound::streaming::StreamingSoundData, AudioManager, AudioManagerSettings, DefaultBackend,
};
use kira::{Easing, StartTime, Tween};
use std::time::Duration;
use tokio::sync::{mpsc, oneshot};

const TWEEN: Tween = Tween {
  duration: Duration::from_millis(0),
  easing: Easing::Linear,
  start_time: StartTime::Immediate,
};

pub fn spawn_audio_thread(mut rx: mpsc::Receiver<(StreamAction, oneshot::Sender<StreamStatus>)>) {
  let audio_manager_settings: AudioManagerSettings<DefaultBackend> = AudioManagerSettings {
    internal_buffer_size: 256,
    ..Default::default()
  };
  let mut audio_manager = AudioManager::new(audio_manager_settings)
    .map_err(|e| e.to_string())
    .unwrap();

  let mut audio_handle: Option<StreamingSoundHandle<FromFileError>> = None;

  let mut state = StreamStatus {
    is_playing: false,
    position: 0.0,
    duration: 0.0,
    is_looping: false,
    path: None,
  };

  while let Some((action, response_tx)) = rx.blocking_recv() {
    match action {
      StreamAction::Play(path) => {
        let new_sound_data = StreamingSoundData::from_file(&path).unwrap(); // this one

        if let Some(handle) = audio_handle.as_mut() {
          handle.stop(TWEEN);
        }

        let duration = new_sound_data.duration().as_secs_f64();

        let mut new_handle = audio_manager.play(new_sound_data).unwrap();
        audio_handle = Some(new_handle);

        state.is_playing = true;
        state.duration = duration;
        state.path = Some(path.clone());
        state.position = 0.0;

        response_tx.send(state.clone());
      }
      StreamAction::SetLoop(should_loop) => {
        if let Some(handle) = audio_handle.as_mut() {
          match should_loop {
            true => handle.set_loop_region(0.0..),
            false => handle.set_loop_region(None),
          }

          state.is_looping = should_loop;

          response_tx.send(state.clone());
        }
      }
      StreamAction::Pause => {
        if let Some(handle) = audio_handle.as_mut() {
          handle.pause(TWEEN);

          state.is_playing = false;
          state.position = handle.position();
        }

        response_tx.send(state.clone());
      }
      StreamAction::Resume => {
        if let Some(handle) = audio_handle.as_mut() {
          handle.resume(TWEEN);

          state.is_playing = true;
          state.position = handle.position();
        }

        response_tx.send(state.clone());
      }
      StreamAction::Seek(to) => {
        if let Some(handle) = audio_handle.as_mut() {
          handle.seek_to(to);
          state.position = handle.position();
        }

        response_tx.send(state.clone());
      }
    }
  }
}
