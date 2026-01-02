fn main() {
  if let Ok(current_dir) = std::env::current_dir() {
    let env_path = current_dir.parent().unwrap().join(".env");
    if env_path.exists() && dotenvy::from_path(&env_path).is_ok() {
      for key in ["LAST_FM_API_KEY", "LAST_FM_CLIENT_SECRET"] {
        if let Ok(value) = std::env::var(key) {
          println!("cargo:rustc-env={}={}", key, value);
        }
      }
    }
  }

  tauri_build::build()
}
