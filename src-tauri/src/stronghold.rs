use iota_stronghold::ClientError;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};
use tauri_plugin_stronghold::stronghold::Stronghold;
use uuid::Uuid;

use crate::error::{Error, Result};

static STRONGHOLD_CLIENT: Mutex<Option<iota_stronghold::Client>> = Mutex::new(None);

pub fn init_stronghold(app: AppHandle<tauri::Wry>) -> Result<()> {
  let stronghold = app.app_handle().try_state::<Stronghold>();
  if stronghold.is_some() {
    return Ok(());
  }

  let vault_entry =
    keyring::Entry::new("swim", "master-key").map_err(|e| Error::Stronghold(e.to_string()))?;

  let vault_pw = match vault_entry.get_password() {
    Ok(pw) => pw,
    Err(_) => {
      let new_pw = Uuid::new_v4().simple().to_string();
      vault_entry
        .set_password(new_pw.as_str())
        .map_err(|e| Error::Stronghold(e.to_string()))?;
      new_pw
    }
  };

  let stronghold_path = app
    .path()
    .app_local_data_dir()
    .expect("failed to get app local data dir")
    .join("swim.hold");
  let stronghold = Stronghold::new(stronghold_path, vault_pw.as_bytes().to_vec())
    .expect("failed to create stronghold");
  app.app_handle().manage(stronghold);

  // return Ok(stronghold);
  return Ok(());
}

pub fn load_stronghold_client<T: AsRef<str>>(
  app_handle: AppHandle<tauri::Wry>,
  client_name: T,
) -> Result<iota_stronghold::Client> {
  init_stronghold(app_handle.clone())?;

  {
    let guard = STRONGHOLD_CLIENT.lock().map_err(|_| {
      Error::Stronghold("failed to lock stronghold client when loading".to_string())
    })?;

    if let Some(client) = &*guard {
      return Ok(client.clone());
    }
  }

  let stronghold = app_handle.state::<Stronghold>();
  let mut client = stronghold.load_client(client_name.as_ref());

  if let Err(ClientError::ClientDataNotPresent) = client {
    client = Ok(
      stronghold
        .create_client(client_name.as_ref())
        .map_err(|_| Error::Stronghold("failed to create client".to_string()))?,
    );
  }

  let client = client.map_err(|_| Error::Stronghold("failed to load client".to_string()))?;

  {
    let mut guard = STRONGHOLD_CLIENT.lock().map_err(|_| {
      Error::Stronghold("failed to lock stronghold client when loading".to_string())
    })?;
    guard.replace(client.clone());
  }

  return Ok(client);
}
