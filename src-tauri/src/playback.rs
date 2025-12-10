use anyhow::{Context, Result};
use rodio::{Decoder, Sink};
use std::fs::File;
use std::io::BufReader;
use std::sync::mpsc::Sender;
use std::sync::OnceLock;
use std::time::Instant;

enum StreamAction {
  Play(String),
  Pause,
  Resume,
  Seek(f64),
  Next,
  Previous,
}

struct StreamStatus {
  is_playing: bool,
  position: f64,
  duration: f64,
  is_empty: bool,
}

static STREAM_TX: OnceLock<Sender<StreamAction>> = OnceLock::new();

#[tauri::command]
pub async fn play_track(path: String) -> std::result::Result<(), String> {
  fn main(path: String) -> Result<()> {
    println!("Requested at: {:#?}", Instant::now());
    let stream = init_stream();
    stream
      .send(StreamAction::Play(path))
      .context("Failed to play track")?;

    return Ok(());
  }

  main(path).map_err(|e| e.to_string())?;

  Ok(())
}

fn init_stream() -> Sender<StreamAction> {
  return STREAM_TX
    .get_or_init(|| {
      let (tx, rx) = std::sync::mpsc::channel::<StreamAction>();

      std::thread::spawn(move || {
        let stream_handle = rodio::OutputStreamBuilder::open_default_stream().unwrap();
        let sink = rodio::Sink::connect_new(stream_handle.mixer());

        loop {
          let action = rx.recv().unwrap();
          match action {
            StreamAction::Play(path) => {
              sink.clear();

              let source = load_track(path).unwrap();
              sink.append(source);
              sink.play();
              println!("Played at: {:#?}", Instant::now());
            }
            StreamAction::Pause => sink.pause(),
            StreamAction::Resume => sink.play(),
            StreamAction::Seek(_) => todo!(),
            StreamAction::Next => todo!(),
            StreamAction::Previous => todo!(),
          }
        }
      });

      return tx;
    })
    .clone();
}

fn load_track(path: String) -> anyhow::Result<Decoder<BufReader<File>>> {
  let file = File::open(path).context("failed to open file")?;
  let source = Decoder::try_from(file).context("failed to create decoder")?;

  return Ok(source);
}
