use anyhow::{Context, Result};
use id3::frame::{Picture, PictureType};
use image::imageops;
use std::collections::HashMap;
use std::fs;
use std::io::Cursor;
use std::path::PathBuf;
use std::sync::{LazyLock, Mutex};
use tauri::http::StatusCode;
use tauri::http::{Request, Response};
use tauri::{Manager, UriSchemeContext, UriSchemeResponder, Wry};

static FULL_COVER_CACHE: LazyLock<Mutex<HashMap<String, Vec<u8>>>> = LazyLock::new(|| {
  let placeholder =
    fs::read("./icons/cover-placeholder.png").expect("Failed to read placeholder image");
  Mutex::new(HashMap::from([("PLACEHOLDER".to_string(), placeholder)]))
});

#[derive(PartialEq)]
pub enum CoverMode {
  Thumbnail,
  Full,
}

pub fn handler(
  ctx: UriSchemeContext<Wry>,
  req: Request<Vec<u8>>,
  responder: UriSchemeResponder,
  mode: CoverMode,
) {
  let cache_dir = match ctx.app_handle().path().app_cache_dir() {
    Ok(dir) => dir,
    Err(_) => {
      return responder.respond(
        Response::builder()
          .status(StatusCode::INTERNAL_SERVER_ERROR)
          .body(b"Internal server error".to_vec())
          .unwrap(),
      )
    }
  };

  tokio::task::spawn_blocking(move || match main(req, cache_dir, mode) {
    Ok(r) => responder.respond(
      Response::builder()
        .header("Content-Type", "image/jpeg")
        .status(StatusCode::OK)
        .body(r)
        .unwrap(),
    ),
    Err(e) => {
      log::error!("Error: {:#?}", e);
      responder.respond(
        Response::builder()
          .status(StatusCode::INTERNAL_SERVER_ERROR)
          .body(b"Internal server error".to_vec())
          .unwrap(),
      )
    }
  });

  fn main(req: Request<Vec<u8>>, cache_dir: PathBuf, mode: CoverMode) -> Result<Vec<u8>> {
    let uri = req.uri();
    let file_path = decode_path(uri.path())?;

    if mode == CoverMode::Full {
      {
        let cache = FULL_COVER_CACHE
          .lock()
          .map_err(|e| anyhow::anyhow!("Failed to lock full cover cache: {}", e))?;
        if let Some(cached_cover) = cache.get(&file_path) {
          return Ok(cached_cover.clone());
        }
      }
    }

    let cover = match get_cover(&file_path) {
      Some(cover) => cover,
      None => return get_placeholder(),
    };

    if mode == CoverMode::Full {
      {
        let mut cache = FULL_COVER_CACHE
          .lock()
          .map_err(|e| anyhow::anyhow!("Failed to lock full cover cache: {}", e))?;
        cache.insert(file_path, cover.clone());
      }
      return Ok(cover);
    }

    let hash = format!("{:x}", md5::compute(&cover));

    if let Ok(cached_cover) = fs::read(cache_dir.join(format!("{}.jpg", &hash.clone()))) {
      return Ok(cached_cover);
    }

    let resized_cover = resize_cover(cover)?;

    fs::write(cache_dir.join(format!("{}.jpg", hash)), &resized_cover).ok();

    return Ok(resized_cover);
  }
}

fn decode_path(path: &str) -> Result<String> {
  let stripped = path
    .strip_prefix("/")
    .ok_or_else(|| anyhow::anyhow!("Failed to remove first character from path"))?
    .to_string();

  let decoded = urlencoding::decode(&stripped).context("Failed to URI decode path")?;

  return Ok(decoded.to_string());
}

fn get_cover(path: &str) -> Option<Vec<u8>> {
  let tag = id3::Tag::read_from_path(path).ok()?;

  let pictures = tag.pictures().cloned().collect::<Vec<Picture>>();

  return get_cover_from_frames(pictures);
}

fn resize_cover(cover: Vec<u8>) -> Result<Vec<u8>> {
  let img = image::load_from_memory(&cover).context("Failed to load cover image from memory")?;
  let img = img.resize_to_fill(64, 64, imageops::FilterType::Lanczos3);

  let mut output = Vec::new();

  img
    .write_to(&mut Cursor::new(&mut output), image::ImageFormat::Jpeg)
    .context("Failed to write cover image to memory")?;

  log::info!("{:#?} bytes", &output.len());
  return Ok(output);
}

fn get_placeholder() -> Result<Vec<u8>> {
  let cache = FULL_COVER_CACHE.lock().map_err(|e| {
    anyhow::anyhow!(
      "Failed to lock full cover cache when getting placeholder: {}",
      e
    )
  })?;
  if let Some(placeholder) = cache.get("PLACEHOLDER") {
    return Ok(placeholder.clone());
  }
  return Err(anyhow::anyhow!("Placeholder not found in cache"));
}

const COVER_PRIORITY: &[PictureType] = &[
  PictureType::CoverFront,
  PictureType::CoverBack,
  PictureType::Other,
];

fn get_cover_from_frames(pictures: Vec<Picture>) -> Option<Vec<u8>> {
  fn find(pictures: &[Picture]) -> Option<Vec<u8>> {
    for picture in pictures {
      if COVER_PRIORITY.contains(&picture.picture_type) {
        return Some(picture.data.clone());
      }
    }

    return None;
  }

  return match find(&pictures) {
    Some(cover) => Some(cover),
    None => pictures.first().map(|p| p.data.clone()),
  };
}
