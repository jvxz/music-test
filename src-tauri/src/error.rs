#[derive(Debug, thiserror::Error, specta::Type)]
#[serde(tag = "type", content = "data")]
pub enum Error {
  #[error("Audio error: `{0}`")]
  Audio(String),
  #[error("ID3 error: `{0}`")]
  Id3(String),
  #[error("File system error: `{0}`")]
  FileSystem(String),
  #[error("LastFM error: `{0}`")]
  LastFm(String),
  #[error("Waveform error: `{0}`")]
  Waveform(String),
  #[error("SQL error: `{0}`")]
  Sql(String),
  #[error("Store error: `{0}`")]
  Store(String),
  #[error("Stronghold error: `{0}`")]
  Stronghold(String),
  #[error("Unknown error: `{0}`")]
  Other(String),
}

pub type Result<T> = std::result::Result<T, Error>;

impl serde::Serialize for Error {
  fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
  where
    S: serde::ser::Serializer,
  {
    serializer.serialize_str(self.to_string().as_ref())
  }
}
