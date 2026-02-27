use crate::error::{Error, Result};
use id3::{Tag, TagLike};
use serde::{Deserialize, Serialize};
use specta::Type;
use std::borrow::Cow;
use std::convert::Into;
use tauri::async_runtime::spawn_blocking;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum TagTypeArg {
  // Ape,
  // #[serde(rename = "id3v1")]
  // Id3v1,
  #[serde(rename = "id3v2.2")]
  Id3v22,
  #[serde(rename = "id3v2.3")]
  Id3v23,
  #[serde(rename = "id3v2.4")]
  Id3v24,
  // Mp4Ilst,
  // VorbisComments,
  // RiffInfo,
  // AiffText,
}

impl From<TagTypeArg> for id3::Version {
  fn from(arg: TagTypeArg) -> Self {
    match arg {
      // TagTypeArg::Ape => lofty::tag::TagType::Ape,
      TagTypeArg::Id3v22 => id3::Version::Id3v22,
      TagTypeArg::Id3v23 => id3::Version::Id3v23,
      TagTypeArg::Id3v24 => id3::Version::Id3v24,
      // TagTypeArg::Mp4Ilst => lofty::tag::TagType::Mp4Ilst,
      // TagTypeArg::VorbisComments => lofty::tag::TagType::VorbisComments,
      // TagTypeArg::RiffInfo => lofty::tag::TagType::RiffInfo,
      // TagTypeArg::AiffText => lofty::tag::TagType::AiffText,
    }
  }
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct FrameArgs {
  pub frame: String,
  pub value: String,
}

#[tauri::command]
#[specta::specta]
pub async fn write_id3_frames(
  file_path: String,
  target_tag: TagTypeArg,
  args: Vec<FrameArgs>,
) -> Result<()> {
  return spawn_blocking(move || {
    let version = id3::Version::from(target_tag);
    let mut tag = get_tag(
      Cow::Borrowed(file_path.as_str()),
      Cow::Borrowed(&target_tag),
    )?;

    for arg in args {
      if arg.value.is_empty() {
        tag.remove(&arg.frame);
        continue;
      }

      tag.set_text(&arg.frame, &arg.value);
    }

    tag
      .write_to_path(&file_path, version)
      .map_err(|e| Error::Id3(format!("Failed to write ID3 tag: {}", e)))?;

    return Ok(());
  })
  .await
  .map_err(|e| Error::Id3(e.to_string()))?;
}

fn get_tag<'a>(file_path: Cow<'a, str>, target_tag: Cow<'a, TagTypeArg>) -> Result<Tag> {
  let version = id3::Version::from(*target_tag);

  let tag = match Tag::read_from_path(file_path.as_ref()) {
    Ok(tag) => tag,
    Err(id3::Error {
      kind: id3::ErrorKind::NoTag,
      ..
    }) => Tag::with_version(version),
    Err(err) => return Err(Error::Id3(err.to_string())),
  };

  return Ok(tag);
}
