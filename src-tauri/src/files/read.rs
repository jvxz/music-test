use anyhow::Context;
use dashmap::DashMap;
use log::debug;
use serde::Serialize;
use specta::Type;
use std::collections::HashMap;
use std::fs::read_dir;
use std::sync::{Arc, LazyLock};
use std::time::Instant;

pub type SerializableTagMap = HashMap<String, String>;

#[derive(Serialize, Type, Clone)]
pub struct FileEntry {
  pub path: String,
  pub name: String,
  pub tags: SerializableTagMap,
  pub thumbnail_uri: String,
  pub full_uri: String,
}

pub static FOLDER_CACHE: LazyLock<DashMap<String, Arc<Vec<FileEntry>>>> =
  LazyLock::new(DashMap::new);
pub static TRACK_CACHE: LazyLock<DashMap<String, Arc<FileEntry>>> = LazyLock::new(DashMap::new);

#[tauri::command]
pub async fn read_folder(path: String) -> Result<Arc<Vec<FileEntry>>, String> {
  let start = Instant::now();

  if let Some(cached_dir) = FOLDER_CACHE.get(&path) {
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
      let mut frames: SerializableTagMap = tag
        .frames()
        .map(|f| (f.id().to_string(), f.content().to_string()))
        .collect();
      if !frames.contains_key("TIT2") {
        if let Some(file_name) = path.file_name().map(|n| n.to_string_lossy().to_string()) {
          frames.insert("TIT2".to_string(), file_name);
        }
      }

      let path_string = path.to_string_lossy().to_string();
      let name = match path.file_name().map(|n| n.to_string_lossy().to_string()) {
        Some(name) => name,
        None => return None,
      };

      return Some(FileEntry {
        path: path_string.clone(),
        name,
        tags: frames,
        thumbnail_uri: build_cover_uri(path_string.as_str(), "thumbnail"),
        full_uri: build_cover_uri(path_string.as_str(), "full"),
      });
    })
    .collect::<Vec<FileEntry>>();

  debug!("Time taken to read folder: {:?}", start.elapsed());

  let data = Arc::new(file_entires);

  FOLDER_CACHE.insert(path, data.clone());

  return Ok(data);
}

#[tauri::command]
pub async fn get_track_data(path: String) -> Result<Arc<FileEntry>, String> {
  if let Some(cached_track) = TRACK_CACHE.get(&path) {
    let data = cached_track.value();
    return Ok(data.clone());
  }

  let file_entry = get_file_entry(&path).map_err(|e| e.to_string())?;

  TRACK_CACHE.insert(path, file_entry.clone());

  return Ok(file_entry);
}

fn get_file_entry(path: &str) -> Result<Arc<FileEntry>, String> {
  let path = std::path::Path::new(path);
  let tag = id3::Tag::read_from_path(path).map_err(|e| e.to_string())?;

  let mut frames: SerializableTagMap = tag
    .frames()
    .map(|f| (f.id().to_string(), f.content().to_string()))
    .collect();

  if !frames.contains_key("TIT2") {
    if let Some(file_name) = path.file_name().map(|n| n.to_string_lossy().to_string()) {
      frames.insert("TIT2".to_string(), file_name);
    }
  }

  let name = match path.file_name().map(|n| n.to_string_lossy().to_string()) {
    Some(name) => name,
    None => "Unknown title".to_string(),
  };

  let path_string = path.to_string_lossy().to_string();

  let data = Arc::new(FileEntry {
    path: path_string.clone(),
    name,
    tags: frames,
    thumbnail_uri: build_cover_uri(path_string.as_str(), "thumbnail"),
    full_uri: build_cover_uri(path_string.as_str(), "full"),
  });

  return Ok(data);
}
fn build_cover_uri(path: &str, mode: &str) -> String {
  return format!("cover-{mode}://localhost/{path}");
}
