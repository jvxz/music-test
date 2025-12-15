use crate::playback::{StreamAction, StreamStatus};
use kira::sound::static_sound::{StaticSoundData, StaticSoundHandle};
use kira::sound::streaming::StreamingSoundHandle;
use kira::sound::FromFileError;
use kira::{
  self, sound::streaming::StreamingSoundData, AudioManager, AudioManagerSettings, DefaultBackend,
};
use kira::{Easing, StartTime, Tween};
use std::thread;
use std::time::Duration;
use tokio::sync::{mpsc, oneshot};

const TWEEN: Tween = Tween {
  duration: Duration::from_millis(0),
  easing: Easing::Linear,
  start_time: StartTime::Immediate,
};

enum InternalEvent {
  Command(StreamAction, oneshot::Sender<StreamStatus>),
  LoadFinished {
    id: i32,
    data: Option<StaticSoundData>,
  },
}

enum CurrentHandle {
  None,
  Streaming(StreamingSoundHandle<FromFileError>),
  Static(StaticSoundHandle),
}

impl CurrentHandle {
  fn stop(&mut self) {
    match self {
      CurrentHandle::None => {}
      CurrentHandle::Streaming(h) => h.stop(TWEEN),
      CurrentHandle::Static(h) => h.stop(TWEEN),
    }
  }

  fn pause(&mut self) {
    match self {
      CurrentHandle::None => {}
      CurrentHandle::Streaming(h) => h.pause(TWEEN),
      CurrentHandle::Static(h) => h.pause(TWEEN),
    }
  }

  fn resume(&mut self) {
    match self {
      CurrentHandle::None => {}
      CurrentHandle::Streaming(h) => h.resume(TWEEN),
      CurrentHandle::Static(h) => h.resume(TWEEN),
    }
  }

  fn seek_to(&mut self, to: f64) {
    match self {
      CurrentHandle::None => {}
      CurrentHandle::Streaming(h) => h.seek_to(to),
      CurrentHandle::Static(h) => h.seek_to(to),
    }
  }

  fn position(&self) -> f64 {
    match self {
      CurrentHandle::None => 0.0,
      CurrentHandle::Streaming(h) => h.position(),
      CurrentHandle::Static(h) => h.position(),
    }
  }

  fn set_loop(&mut self, should_loop: bool) {
    match self {
      CurrentHandle::None => {}
      CurrentHandle::Streaming(h) => {
        if should_loop {
          h.set_loop_region(0.0..);
        } else {
          h.set_loop_region(None);
        }
      }
      CurrentHandle::Static(h) => {
        if should_loop {
          h.set_loop_region(0.0..);
        } else {
          h.set_loop_region(None);
        }
      }
    }
  }
}

pub fn spawn_audio_thread(
  mut ui_rx: mpsc::Receiver<(StreamAction, oneshot::Sender<StreamStatus>)>,
) -> anyhow::Result<()> {
  let (event_tx, mut event_rx) = mpsc::channel::<InternalEvent>(32);

  let event_tx_clone = event_tx.clone();

  // ui event loop
  thread::spawn(move || {
    while let Some(msg) = ui_rx.blocking_recv() {
      event_tx_clone.try_send(InternalEvent::Command(msg.0, msg.1));
    }
  });

  let mut audio_manager: AudioManager<DefaultBackend> = AudioManager::new(AudioManagerSettings {
    internal_buffer_size: 256,
    ..Default::default()
  })
  .unwrap();

  let mut pending_static_data: Option<StaticSoundData> = None;
  let mut audio_handle: CurrentHandle = CurrentHandle::None;

  let (loader_tx, loader_rx) = std::sync::mpsc::channel::<(i32, String)>();
  let mut static_sound_id: i32 = 0;
  let loader_event_tx = event_tx.clone();

  // static loader thread
  thread::spawn(move || {
    while let Ok((id, path)) = loader_rx.recv() {
      let sound = StaticSoundData::from_file(&path).ok();

      loader_event_tx.try_send(InternalEvent::LoadFinished { id, data: sound });
    }
  });

  let mut state = StreamStatus {
    is_playing: false,
    position: 0.0,
    duration: 0.0,
    is_looping: false,
    path: None,
  };

  // main event loop
  while let Some(event) = event_rx.blocking_recv() {
    match event {
      InternalEvent::Command(action, response_tx) => {
        match action {
          StreamAction::Play(path) => {
            // stop previous track
            audio_handle.stop();

            // increment static sound id to load new static sound data
            // without dealing with race conditions
            static_sound_id += 1;
            // reset existing static sound data to prepare for new load
            pending_static_data = None;

            // trigger static sound data loader
            loader_tx.send((static_sound_id, path.clone()));

            let new_sound_data = StreamingSoundData::from_file(&path).unwrap();
            let duration = new_sound_data.duration().as_secs_f64();
            let new_handle = audio_manager.play(new_sound_data).unwrap();

            // set to streaming sound handle for instant playback
            audio_handle = CurrentHandle::Streaming(new_handle);

            audio_handle.set_loop(state.is_looping);

            state.duration = duration;
            state.is_playing = true;
            state.path = Some(path.clone());
            state.position = 0.0;

            response_tx.send(state.clone());
          }
          StreamAction::SetLoop(should_loop) => {
            audio_handle.set_loop(should_loop);

            state.is_looping = should_loop;

            response_tx.send(state.clone());
          }
          StreamAction::Pause => {
            audio_handle.pause();

            state.is_playing = false;
            state.position = audio_handle.position();

            response_tx.send(state.clone());
          }
          StreamAction::Resume => {
            audio_handle.resume();

            state.is_playing = true;

            response_tx.send(state.clone());
          }
          StreamAction::Seek(to) => {
            if let Some(static_data) = pending_static_data.as_ref() {
              match audio_handle {
                CurrentHandle::None => {}
                CurrentHandle::Streaming(mut streaming_sound_handle) => {
                  // stop streaming sound
                  streaming_sound_handle.stop(TWEEN);

                  // swap to static sound data
                  let mut new_handle = audio_manager.play(static_data.clone()).unwrap();
                  new_handle.seek_to(to);
                  if !state.is_playing {
                    new_handle.pause(TWEEN);
                  }

                  // retain looping state
                  if state.is_looping {
                    new_handle.set_loop_region(0.0..);
                  }

                  // swap to static sound handle
                  audio_handle = CurrentHandle::Static(new_handle);
                }
                CurrentHandle::Static(ref mut static_sound_handle) => {
                  static_sound_handle.seek_to(to);
                }
              };
            }

            audio_handle.seek_to(to);

            state.position = to;

            response_tx.send(state.clone());
          }
        }
      }
      InternalEvent::LoadFinished { id, data } => {
        // validate static sound id before updating pending static data
        if id == static_sound_id {
          pending_static_data = data;
        }
      }
    }
  }

  Ok(())
}

// pub fn monitor_audio_thread(
//   audio_thread: thread::JoinHandle<anyhow::Result<()>>,
// ) -> anyhow::Result<()> {
//   return match audio_thread.join() {
//     Ok(result) => match result {
//       Ok(_) => todo!(),
//       Err(err) => {
//         println!("audio thread errored: {:?}", err);
//         Err(err)
//       }
//     },
//     Err(panic) => {
//       unreachable!("audio thread panicked: {:?}", panic);
//     }
//   };
// }
