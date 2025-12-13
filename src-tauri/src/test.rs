use crate::playback::{StreamAction, StreamStatus};
use kira::sound::streaming::StreamingSoundHandle;
use kira::sound::FromFileError;
use kira::{
  self, sound::streaming::StreamingSoundData, AudioManager, AudioManagerSettings, DefaultBackend,
};
use tokio::sync::{mpsc, oneshot};

pub fn spawn_audio_thread(mut rx: mpsc::Receiver<(StreamAction, oneshot::Sender<StreamStatus>)>) {
  let audio_manager_settings = AudioManagerSettings::<DefaultBackend>::default();
  let mut audio_manager = AudioManager::new(audio_manager_settings)
    .map_err(|e| e.to_string())
    .unwrap();

  let mut audio_handle: Option<StreamingSoundHandle<FromFileError>> = None;

  while let Some((action, response_tx)) = rx.blocking_recv() {
    match action {
      StreamAction::Play(path) => {
        let new_sound_data = StreamingSoundData::from_file(path).unwrap(); // this one

        let new_handle = audio_manager.play(new_sound_data).unwrap();
        audio_handle = Some(new_handle);
      }
      StreamAction::SetLoop(should_loop) => {
        if let Some(handle) = audio_handle.as_mut() {
          match should_loop {
            true => handle.set_loop_region(0.0..),
            false => handle.set_loop_region(None),
          }
        }
      }
      StreamAction::Next => todo!(),
      StreamAction::Pause => todo!(),
      StreamAction::Resume => todo!(),
      StreamAction::Seek(_) => todo!(),
      StreamAction::Previous => todo!(),
    }
  }
}
