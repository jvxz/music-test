use std::{
  sync::{atomic::AtomicBool, Arc},
  time::Duration,
};

use crate::playback::{StreamAction, StreamStatus};
use rodio::Source;
use tokio::sync::{mpsc, oneshot};

struct LoopSource<S> {
  root: S,
  should_loop: Arc<AtomicBool>,
}

impl<S> Iterator for LoopSource<S>
where
  S: rodio::Source + Iterator<Item = f32>,
{
  type Item = f32;

  fn next(&mut self) -> Option<Self::Item> {
    match self.root.next() {
      Some(sample) => Some(sample),
      None => match self.should_loop.load(std::sync::atomic::Ordering::Relaxed) {
        true => {
          self.root.try_seek(Duration::ZERO);
          self.root.next()
        }
        false => None,
      },
    }
  }
}

impl<S> rodio::Source for LoopSource<S>
where
  S: rodio::Source + Iterator<Item = f32>,
{
  fn current_span_len(&self) -> Option<usize> {
    self.root.current_span_len()
  }
  fn channels(&self) -> u16 {
    self.root.channels()
  }
  fn sample_rate(&self) -> u32 {
    self.root.sample_rate()
  }
  fn total_duration(&self) -> Option<Duration> {
    self.root.total_duration()
  }
}

pub fn spawn_audio_thread(mut rx: mpsc::Receiver<(StreamAction, oneshot::Sender<StreamStatus>)>) {
  let stream_handle =
    rodio::OutputStreamBuilder::open_default_stream().expect("open default audio stream");
  let sink = rodio::Sink::connect_new(stream_handle.mixer());

  let mut state = StreamStatus {
    is_playing: false,
    position: 0.0,
    duration: 0.0,
    is_empty: true,
    is_looping: false,
    path: None,
  };

  let mut current_loop_flag: Option<Arc<AtomicBool>> = None;

  while let Some((action, response_tx)) = rx.blocking_recv() {
    match action {
      StreamAction::Play(path) => {
        // refactor this
        let loop_flag = Arc::new(AtomicBool::new(state.is_looping));
        current_loop_flag = Some(loop_flag.clone());

        let decoder = get_decoder_builder(&path).build().unwrap();
        let stream = LoopSource {
          root: decoder,
          should_loop: loop_flag.clone(),
        };

        let duration = stream.total_duration().unwrap_or_default().as_secs_f64();
        let is_empty = sink.empty();

        if !is_empty {
          sink.clear();
        }

        sink.append(stream);
        sink.play();

        state.is_playing = true;
        state.is_empty = is_empty;
        state.path = Some(path);
        state.position = 0.0;
        state.duration = duration;

        println!("state: {:?}", state);

        response_tx.send(state.clone());
      }
      StreamAction::SetLoop(should_loop) => {
        state.is_looping = should_loop;

        if let Some(control) = &current_loop_flag {
          control.store(should_loop, std::sync::atomic::Ordering::Relaxed);
        }

        response_tx.send(state.clone());
      }
      StreamAction::Pause => todo!(),
      StreamAction::Resume => todo!(),
      StreamAction::Seek(_) => todo!(),
    }
  }
}

fn get_decoder_builder(path: &str) -> rodio::decoder::DecoderBuilder<std::fs::File> {
  let file = std::fs::File::open(path).unwrap();
  let len = file.metadata().unwrap().len();

  return rodio::decoder::DecoderBuilder::new()
    .with_data(file)
    .with_gapless(true)
    .with_byte_len(len)
    .with_seekable(true);
}
