#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(clippy::needless_return)]
#![warn(clippy::implicit_return)]

fn main() {
  nuxtor_lib::run();
}
