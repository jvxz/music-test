#![deny(clippy::unwrap_used, clippy::expect_used)]
use crate::error::{Error, Result};
use crate::stronghold::load_stronghold_client;
use last_fm_rs::{AuthToken, Client, NowPlaying, Scrobble};
use serde::{Deserialize, Serialize};
use specta::Type;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_stronghold::stronghold::Stronghold;

#[derive(Serialize, Clone, Deserialize, Type, Debug)]
pub struct SerializedScrobble {
  pub artist: String,
  pub track: String,
  pub album: Option<String>,
  pub track_number: Option<u32>,
  pub duration: u32,
  pub album_artist: Option<String>,
}

#[derive(Serialize, Clone, Deserialize, Type, Debug)]
pub struct SerializedOfflineScrobble {
  pub scrobble: SerializedScrobble,
  pub timestamp: u32,
}

#[derive(Serialize, Clone, Deserialize, Type, Debug)]
pub struct SerializedScrobbleResponse {
  pub accepted: u32,
  pub ignored: u32,
}

#[tauri::command]
#[specta::specta]
pub async fn scrobble_track(
  app_handle: AppHandle<tauri::Wry>,
  scrobble: SerializedScrobble,
) -> Result<SerializedScrobbleResponse> {
  let client = get_lastfm_client(app_handle)?;

  let timestamp = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map_err(|_| Error::LastFm("failed to get timestamp when scrobbling track".to_string()))?
    .as_secs();

  let scrobble = serialized_to_struct(scrobble, timestamp as u32);

  let res = client
    .scrobble(&[scrobble])
    .await
    .map_err(|_| Error::LastFm("failed to scrobble track".to_string()))?;

  return Ok(SerializedScrobbleResponse {
    accepted: res.scrobbles.attr.accepted,
    ignored: res.scrobbles.attr.ignored,
  });
}

#[tauri::command]
#[specta::specta]
pub async fn process_offline_scrobbles(
  app_handle: AppHandle<tauri::Wry>,
  scrobbles: Vec<SerializedOfflineScrobble>,
) -> Result<SerializedScrobbleResponse> {
  let client = get_lastfm_client(app_handle)?;

  let scrobbles = scrobbles
    .into_iter()
    .map(|s| serialized_to_struct(s.scrobble, s.timestamp))
    .collect::<Vec<Scrobble>>();

  let res = client
    .scrobble(&scrobbles)
    .await
    .map_err(|_| Error::LastFm("failed to scrobble tracks".to_string()))?;

  return Ok(SerializedScrobbleResponse {
    accepted: res.scrobbles.attr.accepted,
    ignored: res.scrobbles.attr.ignored,
  });
}

#[tauri::command]
#[specta::specta]
pub async fn set_now_playing(
  app_handle: AppHandle<tauri::Wry>,
  scrobble: SerializedScrobble,
) -> Result<()> {
  let client = get_lastfm_client(app_handle)?;
  let SerializedScrobble {
    artist,
    track,
    album,
    track_number,
    duration,
    album_artist,
  } = scrobble;

  let mut now_playing = NowPlaying::new(&artist, &track).with_duration(duration as u64);

  if let Some(album) = &album {
    now_playing = now_playing.with_album(album.as_str());
  }
  if let Some(track_number) = track_number {
    now_playing = now_playing.with_track_number(track_number);
  }
  if let Some(album_artist) = &album_artist {
    now_playing = now_playing.with_album_artist(album_artist);
  }

  client
    .update_now_playing(&now_playing)
    .await
    .map_err(|_| Error::LastFm("failed to update now playing status".to_string()))?;

  return Ok(());
}

#[tauri::command]
#[specta::specta]
pub async fn open_lastfm_auth(app_handle: AppHandle<tauri::Wry>) -> Result<String> {
  let (api_key, api_secret) = get_lastfm_secrets().map_err(|_| {
    Error::LastFm("failed to get last.fm credentials when opening auth".to_string())
  })?;
  let client = Client::new(api_key, api_secret);

  let token = client
    .get_token()
    .await
    .map_err(|e| Error::LastFm(format!("failed to get token when opening auth: {}", e)))?;

  let auth_url = client
    .get_auth_url(&token)
    .map_err(|e| Error::LastFm(format!("failed to get auth url when opening auth: {}", e)))?;

  app_handle
    .opener()
    .open_url(auth_url.as_str(), None::<&str>)
    .map_err(|e| Error::LastFm(format!("failed to open url when opening auth: {}", e)))?;

  return Ok(token.token.to_string());
}

#[tauri::command]
#[specta::specta]
pub async fn complete_lastfm_auth(
  app_handle: AppHandle<tauri::Wry>,
  token: String,
) -> Result<String> {
  let (api_key, api_secret) = get_lastfm_secrets().map_err(|e| {
    Error::LastFm(format!(
      "failed to get last.fm credentials when completing auth: {}",
      e
    ))
  })?;
  let client = Client::new(api_key, api_secret);

  let session = client
    .get_session(&AuthToken { token })
    .await
    .map_err(|e| Error::LastFm(format!("failed to get session when completing auth: {}", e)))?;

  let stronghold = app_handle.state::<Stronghold>();
  let client = load_stronghold_client(app_handle.clone(), "lastfm")?;

  client
    .store()
    .insert(
      b"session_key".to_vec(),
      session.key.as_bytes().to_vec(),
      None,
    )
    .map_err(|e| {
      Error::LastFm(format!(
        "failed to insert session key when completing auth: {}",
        e
      ))
    })?;

  stronghold
    .save()
    .map_err(|_| Error::LastFm("failed to save stronghold when completing auth".to_string()))?;

  return Ok(session.name);
}

#[tauri::command]
#[specta::specta]
pub async fn remove_lastfm_account(app_handle: AppHandle<tauri::Wry>) -> Result<()> {
  let sh = load_stronghold_client(app_handle, "lastfm")?;

  sh.store().clear().map_err(|_| {
    Error::LastFm("failed to clear stronghold when removing last.fm account".to_string())
  })?;

  return Ok(());
}

fn get_lastfm_client(app_handle: AppHandle<tauri::Wry>) -> Result<Client> {
  let session_key = get_session_key(app_handle)?;
  let (api_key, api_secret) = get_lastfm_secrets().map_err(|_| {
    Error::LastFm("failed to get last.fm credentials when getting lastfm client".to_string())
  })?;
  return Ok(Client::new(api_key, api_secret).with_session_key(session_key));
}

fn get_session_key(app_handle: AppHandle<tauri::Wry>) -> Result<String> {
  let sh = load_stronghold_client(app_handle, "lastfm")?;

  let sk = sh
    .store()
    .get(b"session_key")
    .map_err(|_| Error::LastFm("failed to load key session key for last.fm client".to_string()))?;

  let sk = sk.ok_or(Error::LastFm(
    "session key not found in stronghold".to_string(),
  ))?;

  let sk = std::str::from_utf8(&sk)
    .map_err(|_| Error::LastFm("invalid format of session key for last.fm client".to_string()))?;
  return Ok(sk.to_string());
}

#[tauri::command]
#[specta::specta]
pub async fn get_lastfm_auth_status(app_handle: AppHandle<tauri::Wry>) -> Result<bool> {
  let client = get_lastfm_client(app_handle);
  return Ok(client.is_ok());
}

fn get_lastfm_secrets() -> Result<(String, String)> {
  let api_key = option_env!("LAST_FM_API_KEY");
  let api_secret = option_env!("LAST_FM_CLIENT_SECRET");

  let api_key = api_key.ok_or_else(|| Error::LastFm("LAST_FM_API_KEY not found at compile time. Make sure .env file exists in project root during build.".to_string()))?;
  let api_secret = api_secret.ok_or_else(|| Error::LastFm("LAST_FM_CLIENT_SECRET not found at compile time. Make sure .env file exists in project root during build.".to_string()))?;

  Ok((api_key.to_string(), api_secret.to_string()))
}

fn serialized_to_struct(scrobble: SerializedScrobble, timestamp: u32) -> Scrobble {
  let SerializedScrobble {
    artist,
    track,
    album,
    track_number,
    duration,
    album_artist,
  } = scrobble;

  let mut scrobble = Scrobble::new(artist, track, timestamp as u64).with_duration(duration as u64);

  if let Some(album) = album {
    scrobble = scrobble.with_album(album);
  }
  if let Some(track_number) = track_number {
    scrobble = scrobble.with_track_number(track_number);
  }
  if let Some(album_artist) = album_artist {
    scrobble = scrobble.with_album_artist(album_artist);
  }

  return scrobble;
}
