pub fn get_track_identity_key(title: Option<&str>, artist: Option<&str>) -> Option<String> {
  let t = title?.trim().to_lowercase();
  let a = artist?.trim().to_lowercase();

  Some(format!(
    "{}:{}{}:{}",
    t.chars().count(),
    t,
    a.chars().count(),
    a
  ))
}
