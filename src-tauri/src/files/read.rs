use dashmap::DashMap;
use log::debug;
use serde::Serialize;
use specta::Type;
use std::fs::read_dir;
use std::sync::{Arc, LazyLock};
use std::time::Instant;

#[derive(Serialize, Type, Clone)]
pub struct SerializableTagItem {
  pub key: String,
  pub value: String,
}

#[derive(Serialize, Type, Clone)]
pub struct FileEntry {
  pub path: String,
  pub name: String,
  pub tags: Vec<SerializableTagItem>,
}

static STATE: LazyLock<DashMap<String, Arc<Vec<FileEntry>>>> = LazyLock::new(DashMap::new);

#[tauri::command]
pub async fn read_folder(path: String) -> Result<Arc<Vec<FileEntry>>, String> {
  let start = Instant::now();

  if let Some(cached_dir) = STATE.get(&path) {
    let data = cached_dir.value();

    debug!("Time taken to read cache: {:?}", start.elapsed());

    return Ok(data.clone());
  };

  let entires = read_dir(&path).expect("Failed to read downloads folder");

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
      let name = match path.file_name().map(|n| n.to_string_lossy().to_string()) {
        Some(name) => name,
        None => return None,
      };

      return Some(FileEntry {
        path: path_string,
        name,
        tags: frames,
      });
    })
    .collect::<Vec<FileEntry>>();

  debug!("Time taken to read folder: {:?}", start.elapsed());

  let data = Arc::new(file_entires);

  STATE.insert(path, data.clone());

  return Ok(data);
}
