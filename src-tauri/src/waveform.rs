use crate::error::{Error, Result};
use std::{ffi::OsStr, path::Path};
use symphonia::core::{
  audio::SampleBuffer,
  codecs::{DecoderOptions, CODEC_TYPE_NULL},
  errors::Error as SymphoniaError,
  formats::FormatOptions,
  io::MediaSourceStream,
  meta::MetadataOptions,
  probe::Hint,
};
use tauri::{async_runtime::spawn_blocking, AppHandle, Manager};

#[tauri::command]
#[specta::specta]
pub async fn get_waveform(
  app_handle: AppHandle<tauri::Wry>,
  path: String,
  bin_size: f32,
) -> Result<Vec<f32>> {
  spawn_blocking(move || {
    let cache_dir = app_handle
      .app_handle()
      .path()
      .app_cache_dir()
      .map_err(|_| Error::FileSystem("failed to get cache directory".to_string()))?;

    let cache_path = build_cache_path(&path, &cache_dir);
    if let Ok(cached_waveform) = std::fs::read(&cache_path) {
      let cached_waveform = serde_json::from_slice::<Vec<f32>>(&cached_waveform)
        .map_err(|_| Error::Waveform("failed to parse cached waveform".to_string()))?;

      return Ok(cached_waveform);
    }

    let src = std::fs::File::open(&path)
      .map_err(|e| Error::FileSystem(format!("failed to open media: {}", e)))?;

    let mss = MediaSourceStream::new(Box::new(src), Default::default());

    let ext = get_extension_from_filename(&path).ok_or(Error::Waveform(format!(
      "failed to get extension from filename: {}",
      path
    )))?;
    let mut hint = Hint::new();
    hint.with_extension(ext);

    let meta_opts: MetadataOptions = Default::default();
    let fmt_opts: FormatOptions = FormatOptions {
      prebuild_seek_index: true,
      seek_index_fill_rate: 100,
      enable_gapless: true,
    };

    let probed = symphonia::default::get_probe()
      .format(&hint, mss, &fmt_opts, &meta_opts)
      .map_err(|_| Error::Waveform("failed to probe format".to_string()))?;
    let mut format = probed.format;

    let track = format
      .tracks()
      .iter()
      .find(|t| t.codec_params.codec != CODEC_TYPE_NULL)
      .ok_or(Error::Waveform("no supported audio tracks".to_string()))?;

    let dec_opts: DecoderOptions = Default::default();

    let mut decoder = symphonia::default::get_codecs()
      .make(&track.codec_params, &dec_opts)
      .map_err(|_| Error::Waveform("unsupported codec".to_string()))?;

    let track_id = track.id;

    let mut all_samples: Vec<f32> = Vec::with_capacity(bin_size as usize);

    loop {
      let packet = match format.next_packet() {
        Ok(packet) => packet,
        Err(SymphoniaError::ResetRequired) => {
          return Err(Error::Waveform("reset required".to_string()));
        }
        Err(SymphoniaError::IoError(_)) => break,
        Err(err) => {
          return Err(Error::Waveform(format!(
            "failed to get next packet: {}",
            err
          )));
        }
      };

      while !format.metadata().is_latest() {
        format.metadata().pop();
      }

      if packet.track_id() != track_id {
        continue;
      }

      match decoder.decode(&packet) {
        Ok(decoded) => {
          let spec = *decoded.spec();

          // [L,L,R,R] -> [L,R]
          let mut buf = SampleBuffer::<f32>::new(decoded.capacity() as u64, spec);
          buf.copy_interleaved_ref(decoded);

          let samples = buf.samples();
          // convert to mono
          for frame in samples.chunks(spec.channels.count()) {
            let mono_sample: f32 = frame.iter().sum::<f32>() / frame.len() as f32;
            all_samples.push(mono_sample);
          }
        }
        Err(SymphoniaError::IoError(_)) => {
          continue;
        }
        Err(SymphoniaError::DecodeError(_)) => {
          continue;
        }
        Err(err) => {
          return Err(Error::Waveform(format!("failed to decode packet: {}", err)));
        }
      }
    }

    let mut waveform_data = Vec::new();

    // chunk the samples into bins
    for chunk in all_samples.chunks(bin_size as usize) {
      let mut min = 0.0;
      let mut max = 0.0;

      for &sample in chunk {
        if sample < min {
          min = sample;
        }
        if sample > max {
          max = sample;
        }
      }

      waveform_data.push((min * 100.0).round());
      waveform_data.push((max * 100.0).round());
    }

    waveform_data = ensure_min_samples(waveform_data, 2048);

    std::fs::write(
      &cache_path,
      serde_json::to_vec(&waveform_data)
        .map_err(|_| Error::Waveform("failed to serialize waveform".to_string()))?,
    )
    .map_err(|_| Error::Waveform("failed to write waveform to cache".to_string()))?;

    Ok(waveform_data)
  })
  .await
  .map_err(|e| Error::Waveform(e.to_string()))?
}

fn get_extension_from_filename(filename: &str) -> Option<&str> {
  return Path::new(filename).extension().and_then(OsStr::to_str);
}

fn build_cache_path(file_path: &str, cache_dir: &Path) -> String {
  let hash = format!("{:x}", md5::compute(file_path));
  return cache_dir
    .join(format!("{}-wf.json", hash))
    .to_string_lossy()
    .to_string();
}

fn ensure_min_samples(data: Vec<f32>, target_count: usize) -> Vec<f32> {
  let current_count = data.len() / 2; // pairs of min/max
  if current_count >= target_count {
    return data;
  }

  let mut interpolated = Vec::with_capacity(target_count * 2);
  for i in 0..target_count {
    let index = (i as f32 * (current_count - 1) as f32) / (target_count - 1) as f32;
    let low = index.floor() as usize;
    let high = index.ceil() as usize;
    let weight = index - low as f32;

    let min = data[low * 2] * (1.0 - weight) + data[high * 2] * weight;
    let max = data[low * 2 + 1] * (1.0 - weight) + data[high * 2 + 1] * weight;

    interpolated.push(min);
    interpolated.push(max);
  }
  return interpolated;
}
