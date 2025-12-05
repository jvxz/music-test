#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(clippy::needless_return)]
#![warn(clippy::implicit_return)]

fn main() {
  env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
  nuxtor_lib::run();
}
