use crate::playback::{StreamAction, StreamStatus};
use rodio::Source;
use tokio::sync::{mpsc, oneshot};

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

  while let Some((action, response_tx)) = rx.blocking_recv() {
    match action {
      StreamAction::Play(path) => {
        let stream = rodio::Decoder::new(std::fs::File::open(&path).unwrap()).unwrap();
        let duration = stream.total_duration().unwrap_or_default().as_secs_f64();
        let is_empty = sink.empty();

        if state.is_looping {
          let stream = get_decoder_builder(&path).build_looped().unwrap();
          sink.append(stream);
        } else {
          let stream = get_decoder_builder(&path).build().unwrap();
          sink.append(stream);
        }

        sink.play();

        state.is_playing = true;
        state.is_empty = is_empty;
        state.path = Some(path);
        state.position = 0.0;
        state.duration = duration;

        println!("state: {:?}", state);

        let _ = response_tx.send(state.clone());
      }
      StreamAction::SetLoop(should_loop) => {
        if let Some(path) = &state.path {
          if state.is_looping == should_loop {
            continue;
          }

          state.is_looping = should_loop;

          let position = sink.get_pos();
          sink.stop();

          if should_loop {
            let stream = get_decoder_builder(path).build_looped().unwrap();
            sink.append(stream);
          } else {
            let stream = get_decoder_builder(path).build().unwrap();
            sink.append(stream);
          }
          let _ = sink.try_seek(position);

          let _ = response_tx.send(state.clone());
        }
      }
      _ => todo!(),
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
