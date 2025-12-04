use std::fs::File;
use std::io::BufReader;
use tauri::{AppHandle, Emitter};

static PATH: &str = "path/to/file";

#[tauri::command]
pub async fn read_file_test(app: AppHandle) -> Result<(), String> {
  tauri::async_runtime::spawn_blocking(move || {
    let stream_handle = rodio::OutputStreamBuilder::open_default_stream().unwrap();
    let file = BufReader::new(File::open(PATH).unwrap());

    let sink = rodio::play(stream_handle.mixer(), file).unwrap();

    app.emit("play_file", PATH).unwrap();

    sink.sleep_until_end();
  });

  Ok(())
}
