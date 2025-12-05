use log::info;
use serde::Serialize;
use specta::Type;
use std::fs::read_dir;
use std::time::Instant;

#[derive(Serialize, Type)]
pub struct SerializableTagItem {
  pub key: String,
  pub value: String,
}

#[derive(Serialize, Type)]
pub struct FileEntry {
  pub path: String,
  pub name: String,
  pub tags: Vec<SerializableTagItem>,
}

pub async fn read_folder(path: String) -> Vec<FileEntry> {
  let start = Instant::now();
  let entires = read_dir(&path).expect("Failed to read downloads folder");

  info!("Reading folder: {}", &path);

  let file_entires = entires
    .filter_map(|e| e.ok())
    .filter(|entry| entry.path().is_file())
    .filter_map(|e| {
      let path = e.path();
      let tag = id3::Tag::read_from_path(&path).ok()?;
      let frames = tag
        .frames()
        .map(|f| {
          return SerializableTagItem {
            key: f.id().to_string(),
            value: f.content().to_string(),
          };
        })
        .collect::<Vec<SerializableTagItem>>();

      let path_string = path.to_string_lossy().to_string();
      let name = path.file_name().unwrap().to_string_lossy().to_string();

      return Some(FileEntry {
        path: path_string,
        name,
        tags: frames,
      });
    })
    .collect::<Vec<FileEntry>>();

  let duration = start.elapsed();
  info!("Time taken to read folder: {:?}", duration);

  return file_entires;
}
