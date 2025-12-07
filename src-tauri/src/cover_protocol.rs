use anyhow::{Context, Result};
use lru::LruCache;
use std::num::NonZeroUsize;
use std::sync::{LazyLock, Mutex};
use tauri::http::{Request, Response};
use tauri::{UriSchemeContext, Wry};

pub static COVER_CACHE: LazyLock<Mutex<LruCache<String, Vec<u8>>>> = LazyLock::new(|| {
  let cache: LruCache<String, Vec<u8>> = LruCache::new(NonZeroUsize::new(100).unwrap());
  return cache.into();
});

pub fn handler(_ctx: UriSchemeContext<Wry>, req: Request<Vec<u8>>) -> Response<Vec<u8>> {
  fn main(req: Request<Vec<u8>>) -> Result<Response<Vec<u8>>> {
    let file_path = decode_path(req.uri().path())?;

    {
      let mut cache = COVER_CACHE
        .lock()
        .map_err(|e| anyhow::anyhow!("Failed to acquire cache lock {:#?}", e))?;
      if let Some(bytes) = cache.get(&file_path) {
        return Ok(make_response(bytes.clone(), 200));
      }
    }

    let cover = get_cover(&file_path).unwrap_or_default();

    {
      let mut cache = COVER_CACHE
        .lock()
        .map_err(|e| anyhow::anyhow!("Failed to acquire cache lock {:#?}", e))?;
      cache.put(file_path, cover.clone());
    }

    return Ok(
      Response::builder()
        .status(200)
        .body(cover)
        .expect("Cover request failed"),
    );
  }

  return match main(req) {
    Ok(r) => r,
    Err(e) => {
      log::error!("Error: {:#?}", e);
      Response::builder()
        .status(500)
        .body(b"Internal server error".to_vec())
        .expect("Failed to build response")
    }
  };
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

  let main_cover = tag
    .pictures()
    .find(|p| p.picture_type == id3::frame::PictureType::CoverFront)?;

  return Some(main_cover.data.clone());
}

fn make_response<T>(body: T, status: u16) -> tauri::http::Response<T> {
  Response::builder()
    .status(status)
    .body(body)
    .expect("Failed to build response")
}
