use crate::error::Error;
use crate::error::Result;
use crate::id3::TagTypeArg;
use dashmap::DashMap;
use id3::v1v2::read_from_path;
use id3::ErrorKind;
use id3::Tag;
use serde::Serialize;
use specta::Type;
use std::borrow::Cow;
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
  pub filename: String,
  pub tags: SerializableTagMap,
  pub thumbnail_uri: String,
  pub full_uri: String,
  pub is_playlist_track: bool,
  pub valid: bool,
  pub primary_tag: Option<TagTypeArg>,
  pub extension: String,
}

pub static FOLDER_CACHE: LazyLock<DashMap<String, Arc<Vec<FileEntry>>>> =
  LazyLock::new(DashMap::new);
pub static TRACK_CACHE: LazyLock<DashMap<String, FileEntry>> = LazyLock::new(DashMap::new);

#[tauri::command]
#[specta::specta]
pub fn read_folder(path: String) -> Result<Arc<Vec<FileEntry>>> {
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
#[specta::specta]
pub fn get_canonical_path(path: String) -> Result<String> {
  std::fs::canonicalize(path)
    .map(|p| p.to_string_lossy().to_string())
    .map_err(|e| Error::Other(e.to_string()))
}

#[tauri::command]
#[specta::specta]
pub fn get_tracks_data(paths: Vec<String>) -> Vec<FileEntry> {
  paths
    .into_iter()
    .filter_map(|path| get_track_data(Cow::Owned(path)).ok())
    .collect()
}

#[tauri::command]
#[specta::specta]
pub fn get_track_data(path_string: Cow<'_, str>) -> Result<FileEntry> {
  if let Some(cached_track) = TRACK_CACHE.get(path_string.as_ref()) {
    let data = cached_track.value().clone();
    return Ok(data);
  }

  let path = PathBuf::from(path_string.as_ref());

  let file_entry = file_entry_from_path(path)?;

  TRACK_CACHE.insert(path_string.as_ref().to_string(), file_entry.clone());

  return Ok(file_entry);
}

fn file_entry_from_path(path: PathBuf) -> Result<FileEntry> {
  if !path.is_file() {
    return Ok(FileEntry {
      filename: path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or("Unknown filename".to_string()),
      tags: SerializableTagMap::new(),
      full_uri: String::new(),
      thumbnail_uri: String::new(),
      path: path.to_string_lossy().to_string(),
      name: path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or("Unknown title".to_string()),
      is_playlist_track: false,
      valid: false,
      primary_tag: None,
      extension: String::new(),
    });
  }

  let primary_tag = get_primary_tag(&path)?;
  let tag_map = get_tag_map(primary_tag.clone())?;
  let full_uri = build_cover_uri(path.to_string_lossy().as_ref(), "full");
  let thumbnail_uri = build_cover_uri(path.to_string_lossy().as_ref(), "thumbnail");
  let name = path
    .file_name()
    .map(|n| n.to_string_lossy().to_string())
    .unwrap_or("Unknown title".to_string());
  let filename = path
    .file_name()
    .map(|n| n.to_string_lossy().to_string())
    .unwrap_or("Unknown filename".to_string());
  let extension = path
    .extension()
    .map(|n| n.to_string_lossy().to_string())
    .unwrap_or("Unknown extension".to_string());

  return Ok(FileEntry {
    filename,
    tags: tag_map,
    full_uri,
    thumbnail_uri,
    path: path.to_string_lossy().to_string(),
    name,
    is_playlist_track: false,
    valid: true,
    primary_tag: get_primary_tag_version(primary_tag),
    extension,
  });
}

fn get_tag_map(tag: Option<Tag>) -> Result<SerializableTagMap> {
  return match tag {
    Some(tag) => {
      let tag_map: SerializableTagMap = HashMap::from_iter(
        tag
          .frames()
          .map(|f| (f.id().to_string(), f.content().to_string())),
      );

      return Ok(tag_map);
    }
    None => Ok(SerializableTagMap::new()),
  };
}

fn get_primary_tag(path: impl AsRef<Path>) -> Result<Option<Tag>> {
  let path = path.as_ref();
  return Ok(match read_from_path(path) {
    Ok(tag) => Some(tag),
    Err(err) => {
      if matches!(err.kind, ErrorKind::NoTag) {
        return Ok(None);
      }

      return Err(Error::Id3(err.to_string()));
    }
  });
}

fn get_primary_tag_version(tag: Option<Tag>) -> Option<TagTypeArg> {
  return match tag {
    Some(tag) => {
      return match tag.version() {
        id3::Version::Id3v22 => Some(TagTypeArg::Id3v22),
        id3::Version::Id3v23 => Some(TagTypeArg::Id3v23),
        id3::Version::Id3v24 => Some(TagTypeArg::Id3v24),
      };
    }
    None => None,
  };
}

fn is_supported(path: impl AsRef<Path>) -> bool {
  let supported = [
    // "mp3", "mp2", "mp1", "flac", "wav", "ogg", "oga", "m4a", "mp4", "aac", "mkv", "mka", "webm",
    "mp3", "mp2", "mp1", "flac", "wav", "ogg", "oga", "m4a", "aac",
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
