use iota_stronghold::ClientError;
use tauri::{async_runtime::spawn_blocking, AppHandle, Manager, State};
use tauri_plugin_stronghold::stronghold::Stronghold;
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::error::{Error, Result};

static STRONGHOLD_CLIENT: Mutex<Option<iota_stronghold::Client>> = Mutex::const_new(None);
static STRONGHOLD_INIT: Mutex<bool> = Mutex::const_new(false);

pub async fn load_stronghold(app: &AppHandle<tauri::Wry>) -> Result<State<'_, Stronghold>> {
  let mut init = STRONGHOLD_INIT.lock().await;
  if *init {
    return Ok(app.state::<Stronghold>());
  }

  let stronghold = app.app_handle().try_state::<Stronghold>();

  match stronghold {
    Some(_) => Ok::<_, Error>(()),
    None => {
      let app_clone = app.clone();

      spawn_blocking(move || {
        let vault_entry = keyring::Entry::new("swim", "master-key")
          .map_err(|e| Error::Stronghold(e.to_string()))?;

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

        let stronghold_path = app_clone
          .path()
          .app_local_data_dir()
          .expect("failed to get app local data dir")
          .join("swim.hold");
        let stronghold = Stronghold::new(stronghold_path, vault_pw.as_bytes().to_vec())
          .expect("failed to create stronghold");
        app_clone.app_handle().manage(stronghold);

        return Ok(());
      })
      .await
      .map_err(|e| Error::Stronghold(e.to_string()))?
    }
  }?;

  *init = true;

  return Ok(app.state::<Stronghold>());
}

pub async fn load_stronghold_client(
  app_handle: AppHandle<tauri::Wry>,
  client_name: String,
) -> Result<iota_stronghold::Client> {
  load_stronghold(&app_handle).await?;

  {
    let guard = STRONGHOLD_CLIENT.lock().await;

    if let Some(client) = &*guard {
      return Ok(client.clone());
    }
  }

  let client = spawn_blocking(move || {
    let stronghold = app_handle.state::<Stronghold>();
    let mut client = stronghold.load_client(&client_name);

    if let Err(ClientError::ClientDataNotPresent) = client {
      client = Ok(
        stronghold
          .create_client(&client_name)
          .map_err(|_| Error::Stronghold("failed to create client".to_string()))?,
      );
    }

    return client.map_err(|_| Error::Stronghold("failed to load client".to_string()));
  })
  .await
  .map_err(|e| Error::Stronghold(e.to_string()))??;

  {
    let mut guard = STRONGHOLD_CLIENT.lock().await;
    guard.replace(client.clone());
  }

  return Ok(client);
}
