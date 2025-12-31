use anyhow::Result;
use iota_stronghold::ClientError;
use last_fm_rs::{AuthToken, Client};
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_stronghold::stronghold::Stronghold;

const LASTFM_API_KEY: &str = "_";
const LASTFM_API_SECRET: &str = "_";

#[tauri::command]
pub async fn open_lastfm_auth<R: Runtime>(app_handle: AppHandle<R>) -> Result<String, String> {
  async fn main<R: Runtime>(app_handle: AppHandle<R>) -> anyhow::Result<String> {
    let client = Client::new(LASTFM_API_KEY, LASTFM_API_SECRET);

    let token = client.get_token().await.map_err(|e| anyhow::anyhow!(e))?;
    println!("token: {:?}", token);

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
    let client = Client::new(LASTFM_API_KEY, LASTFM_API_SECRET);

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

    return Ok(session.key);
  }

  let session = main(app_handle, token).await.map_err(|e| e.to_string())?;

  return Ok(session);
}
