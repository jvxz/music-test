use anyhow::Result;
use iota_stronghold::ClientError;
use last_fm_rs::{AuthToken, Client, NowPlaying, Scrobble};
use serde::{Deserialize, Serialize};
use specta::Type;
use std::{
  sync::Mutex,
  time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_stronghold::stronghold::Stronghold;

static STRONGHOLD_CLIENT: Mutex<Option<iota_stronghold::Client>> = Mutex::new(None);

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
pub struct SerializedScrobbleResponse {
  pub accepted: u32,
  pub ignored: u32,
}

#[tauri::command]
pub async fn scrobble_track<R: Runtime>(
  app_handle: AppHandle<R>,
  scrobble: SerializedScrobble,
) -> SerializedScrobbleResponse {
  let client = get_lastfm_client(app_handle);

  let timestamp = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .expect("failed to get timestamp")
    .as_secs();

  let SerializedScrobble {
    artist,
    track,
    album,
    track_number,
    duration,
    album_artist,
  } = scrobble;

  let mut scrobble = Scrobble::new(artist, track, timestamp).with_duration(duration as u64);

  if let Some(album) = album {
    scrobble = scrobble.with_album(album);
  }
  if let Some(track_number) = track_number {
    scrobble = scrobble.with_track_number(track_number);
  }
  if let Some(album_artist) = album_artist {
    scrobble = scrobble.with_album_artist(album_artist);
  }

  let res = client
    .scrobble(&[scrobble])
    .await
    .expect("failed to scrobble track");

  return SerializedScrobbleResponse {
    accepted: res.scrobbles.attr.accepted,
    ignored: res.scrobbles.attr.ignored,
  };
}

#[tauri::command]
pub async fn set_now_playing<R: Runtime>(app_handle: AppHandle<R>, scrobble: SerializedScrobble) {
  let client = get_lastfm_client(app_handle);

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
    .expect("failed to update now playing");
}

#[tauri::command]
pub async fn open_lastfm_auth<R: Runtime>(app_handle: AppHandle<R>) -> Result<String, String> {
  async fn main<R: Runtime>(app_handle: AppHandle<R>) -> anyhow::Result<String> {
    let (api_key, api_secret) = get_lastfm_secrets();
    let client = Client::new(api_key, api_secret);

    let token = client.get_token().await.map_err(|e| anyhow::anyhow!(e))?;

    let auth_url = client
      .get_auth_url(&token)
      .map_err(|e| anyhow::anyhow!(e))?;

    app_handle
      .opener()
      .open_url(auth_url.as_str(), None::<&str>)?;

    return Ok(token.token.to_string());
  }

  let token = main(app_handle).await.map_err(|e| e.to_string())?;

  return Ok(token);
}

#[tauri::command]
pub async fn complete_lastfm_auth<R: Runtime>(
  app_handle: AppHandle<R>,
  token: String,
) -> Result<String, String> {
  async fn main<R: Runtime>(app_handle: AppHandle<R>, token: String) -> anyhow::Result<String> {
    let (api_key, api_secret) = get_lastfm_secrets();
    let client = Client::new(api_key, api_secret);

    let session = client
      .get_session(&AuthToken { token })
      .await
      .map_err(|e| anyhow::anyhow!(e))?;

    let stronghold = app_handle.state::<Stronghold>();
    let mut client = stronghold.load_client("lastfm");

    if let Err(ClientError::ClientDataNotPresent) = client {
      client = Ok(
        stronghold
          .create_client("lastfm")
          .expect("failed to create client"),
      );
    }

    let client = client.expect("failed to load client");

    client.store().insert(
      b"session_key".to_vec(),
      session.key.as_bytes().to_vec(),
      None,
    )?;

    stronghold.save();

    return Ok(session.name);
  }

  let session_name = main(app_handle, token).await.map_err(|e| e.to_string())?;

  return Ok(session_name);
}

#[tauri::command]
pub async fn remove_lastfm_account<R: Runtime>(app_handle: AppHandle<R>) -> Result<(), String> {
  let sh = load_stronghold_client(app_handle);

  sh.store().clear();

  return Ok(());
}

fn get_lastfm_client<R: Runtime>(app_handle: AppHandle<R>) -> Client {
  let session_key = get_session_key(app_handle);
  let (api_key, api_secret) = get_lastfm_secrets();
  return Client::new(api_key, api_secret).with_session_key(session_key);
}

fn get_session_key<R: Runtime>(app_handle: AppHandle<R>) -> String {
  let sh = load_stronghold_client(app_handle);

  let sk = sh
    .store()
    .get(b"session_key")
    .expect("failed to load key 'session_key' from stronghold");
  let sk = sk.expect("no 'session_key' in stronghold");
  let sk = std::str::from_utf8(&sk).expect("invalid format of session_key in stronghold");

  return sk.to_string();
}

fn load_stronghold_client<R: Runtime>(app_handle: AppHandle<R>) -> iota_stronghold::Client {
  {
    let guard = STRONGHOLD_CLIENT.lock().unwrap();
    if let Some(client) = &*guard {
      return client.clone();
    }
  }

  let stronghold = app_handle.state::<Stronghold>();
  let mut client = stronghold.load_client("lastfm");

  if let Err(ClientError::ClientDataNotPresent) = client {
    client = Ok(
      stronghold
        .create_client("lastfm")
        .expect("failed to create client"),
    );
  }

  let client = client.expect("failed to load client");

  {
    let mut guard = STRONGHOLD_CLIENT.lock().unwrap();
    guard.replace(client.clone());
  }

  return client;
}

fn get_lastfm_secrets() -> (String, String) {
  let api_key = std::env::var("LAST_FM_API_KEY").expect("LAST_FM_API_KEY not found");
  let api_secret = std::env::var("LAST_FM_CLIENT_SECRET").expect("LAST_FM_CLIENT_SECRET not found");
  return (api_key.to_string(), api_secret.to_string());
}
