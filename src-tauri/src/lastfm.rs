use anyhow::Result;
use last_fm_rs::{AuthToken, Client, SessionKey};
use tauri::{AppHandle, Runtime};
use tauri_plugin_opener::OpenerExt;

#[tauri::command]
pub async fn open_lastfm_auth<R: Runtime>(app_handle: AppHandle<R>) -> Result<String, String> {
  async fn main<R: Runtime>(app_handle: AppHandle<R>) -> anyhow::Result<String> {
    let client = Client::new("_", "_");

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

pub async fn get_lastfm_session_key(token: String) -> Result<(), String> {
  async fn main(token: String) -> anyhow::Result<SessionKey> {
    let client = Client::new("_", "_");

    let session = client
      .get_session(&AuthToken { token })
      .await
      .map_err(|e| anyhow::anyhow!(e))?;

    println!("session: {:?}", session);

    return Ok(session);
  }

  main(token).await.map_err(|e| e.to_string())?;

  return Ok(());
}
