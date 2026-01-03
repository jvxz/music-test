use crate::error::Error;
use crate::error::Result;
use dashmap::DashMap;
use id3::v1v2::read_from_path;
use id3::ErrorKind;
use serde::Deserialize;
use serde::Serialize;
use specta::Type;
use std::collections::HashMap;
use std::fs::read_dir;
use std::path::Path;
use std::path::PathBuf;
use std::sync::{Arc, LazyLock};

pub type SerializableTagMap = HashMap<String, String>;

#[derive(Serialize, Type, Clone)]
pub struct FileEntry {
  pub path: String,
  pub name: String,
  pub tags: SerializableTagMap,
  pub thumbnail_uri: String,
  pub full_uri: String,
  pub is_playlist_track: bool,
}

pub static FOLDER_CACHE: LazyLock<DashMap<String, Arc<Vec<FileEntry>>>> =
  LazyLock::new(DashMap::new);
pub static TRACK_CACHE: LazyLock<DashMap<String, FileEntry>> = LazyLock::new(DashMap::new);

#[derive(Serialize, Type, Clone, Deserialize, Debug, PartialEq)]
pub enum SortOrder {
  Asc,
  Desc,
}

#[derive(Serialize, Type, Clone, Deserialize, Debug, PartialEq)]
pub struct SortMethod {
  pub key: String,
  pub order: SortOrder,
}

#[tauri::command]
pub async fn read_folder(path: String) -> Result<Arc<Vec<FileEntry>>> {
  if let Some(cached_dir) = FOLDER_CACHE.get(&path) {
    let data = cached_dir.value();

    return Ok(data.clone());
  };

  let entires = read_dir(&path).expect("Failed to read folder");

  let file_entries = entires
    .filter_map(|result| result.ok())
    .filter(|dir_entry| dir_entry.path().is_file())
    .filter(|dir_entry| is_supported(dir_entry.path()))
    .map(|dir_entry| file_entry_from_path(dir_entry.path()))
    .collect::<Result<Vec<FileEntry>>>()?;

  let data = Arc::new(file_entries);

  FOLDER_CACHE.insert(path, data.clone());

  return Ok(data);
}

#[tauri::command]
pub async fn get_track_data(path_string: impl AsRef<str>) -> Option<FileEntry> {
  return _get_track_data(path_string).unwrap_or(None);
}

#[tauri::command]
pub async fn get_tracks_data(paths: Vec<String>) -> Vec<FileEntry> {
  let tracks = paths.into_iter().map(_get_track_data);

  let tracks = tracks
    .filter_map(|result| match result {
      Ok(Some(entry)) => Some(entry),
      _ => None,
    })
    .collect::<Vec<FileEntry>>();

  return tracks;
}

fn _get_track_data(path_string: impl AsRef<str>) -> Result<Option<FileEntry>> {
  if let Some(cached_track) = TRACK_CACHE.get(path_string.as_ref()) {
    let data = cached_track.value().clone();
    return Ok(Some(data));
  }

  let path = PathBuf::from(path_string.as_ref());

  if !path.is_file() {
    return Ok(None);
  }

  let file_entry = file_entry_from_path(&path)?;

  TRACK_CACHE.insert(path_string.as_ref().to_string(), file_entry.clone());

  return Ok(Some(file_entry));
}

fn file_entry_from_path(path: impl AsRef<Path>) -> Result<FileEntry> {
  let path = path.as_ref();
  let tag_map = get_tag_map(path)?;
  let full_uri = build_cover_uri(path.to_string_lossy().as_ref(), "full");
  let thumbnail_uri = build_cover_uri(path.to_string_lossy().as_ref(), "thumbnail");
  let name = path
    .file_name()
    .map(|n| n.to_string_lossy().to_string())
    .unwrap_or("Unknown title".to_string());

  return Ok(FileEntry {
    tags: tag_map,
    full_uri,
    thumbnail_uri,
    path: path.to_string_lossy().to_string(),
    name,
    is_playlist_track: false,
  });
}

fn get_tag_map(path: impl AsRef<Path>) -> Result<SerializableTagMap> {
  let path = path.as_ref();
  let tag_from_valid_track = match read_from_path(path) {
    Ok(tag) => tag,
    Err(err) => {
      if matches!(err.kind, ErrorKind::NoTag) {
        return Ok(SerializableTagMap::new());
      }

      return Err(Error::Id3(err.to_string()));
    }
  };

  let tag_map: SerializableTagMap = HashMap::from_iter(
    tag_from_valid_track
      .frames()
      .map(|f| (f.id().to_string(), f.content().to_string())),
  );

  return Ok(tag_map);
}

fn is_supported(path: impl AsRef<Path>) -> bool {
  let supported = [
    // "mp3", "mp2", "mp1", "flac", "wav", "ogg", "oga", "m4a", "mp4", "aac", "mkv", "mka", "webm",
    "mp3", "mp2", "mp1", "flac", "wav", "ogg", "oga",
  ];

  path
    .as_ref()
    .extension()
    .and_then(|ext| ext.to_str())
    .map(|ext| supported.contains(&ext.to_lowercase().as_str()))
    .unwrap_or(false)
}

fn build_cover_uri(path: impl AsRef<str>, mode: impl AsRef<str>) -> String {
  return format!("cover-{}://localhost/{}", mode.as_ref(), path.as_ref());
}

// fn to_sorted(file_entries: Arc<Vec<FileEntry>>, sort_method: SortMethod) -> Arc<Vec<FileEntry>> {
//   let mut file_entries = file_entries.to_vec();
//   file_entries.sort_by(|a, b| {
//     let mut a_value = a.tags.get(&sort_method.key);
//     if sort_method.key == "TIT2" {
//       a_value = Some(a_value.unwrap_or(&a.name));
//     }

//     let mut b_value = b.tags.get(&sort_method.key);
//     if sort_method.key == "TIT2" {
//       b_value = Some(b_value.unwrap_or(&b.name));
//     }

//     let res = match (a_value, b_value) {
//       (Some(a_value), Some(b_value)) => a_value.to_lowercase().cmp(&b_value.to_lowercase()),
//       (None, None) => std::cmp::Ordering::Equal,
//       (None, Some(_)) => std::cmp::Ordering::Greater,
//       (Some(_), None) => std::cmp::Ordering::Less,
//     };

//     return match sort_method.order {
//       SortOrder::Asc => res,
//       SortOrder::Desc => res.reverse(),
//     };
//   });
//   return Arc::new(file_entries);
// }
