use anyhow::{Context, Result};
use image::imageops;
use std::fs;
use std::io::Cursor;
use std::path::PathBuf;
use tauri::http::StatusCode;
use tauri::http::{Request, Response};
use tauri::{Manager, UriSchemeContext, UriSchemeResponder, Wry};

pub fn handler(_ctx: UriSchemeContext<Wry>, req: Request<Vec<u8>>, responder: UriSchemeResponder) {
  let cache_dir = match _ctx.app_handle().path().app_cache_dir() {
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

  tokio::task::spawn_blocking(move || match main(req, cache_dir) {
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

  fn main(req: Request<Vec<u8>>, cache_dir: PathBuf) -> Result<Vec<u8>> {
    let file_path = decode_path(req.uri().path())?;

    let cover = match get_cover(&file_path) {
      Some(cover) => cover,
      None => return Ok(Vec::new()),
    };

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

  let main_cover = tag
    .pictures()
    .find(|p| p.picture_type == id3::frame::PictureType::CoverFront)?;

  return Some(main_cover.data.clone());
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
