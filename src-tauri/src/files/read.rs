use std::fs::File;
use std::io::BufReader;

static PATH: &str = "/Users/jamie/Downloads/track.mp3";

#[tauri::command]
pub async fn read_file_test() -> Result<(), String> {
  tauri::async_runtime::spawn_blocking(|| {
    let stream_handle = rodio::OutputStreamBuilder::open_default_stream().unwrap();
    let file = BufReader::new(File::open(PATH).unwrap());

    let sink = rodio::play(stream_handle.mixer(), file).unwrap();

    sink.sleep_until_end();
  });

  Ok(())
}
