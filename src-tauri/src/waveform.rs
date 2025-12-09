use anyhow::{anyhow, Context, Error as AnyhowError, Result};
use std::{ffi::OsStr, path::Path};
use symphonia::core::{
  audio::SampleBuffer,
  codecs::{DecoderOptions, CODEC_TYPE_NULL},
  errors::Error,
  formats::FormatOptions,
  io::MediaSourceStream,
  meta::MetadataOptions,
  probe::Hint,
};
use tauri::{AppHandle, Manager, Runtime};

#[tauri::command]
pub async fn get_waveform<R: Runtime>(
  app_handle: AppHandle<R>,
  path: String,
  bin_size: f32,
) -> Result<Vec<f32>, String> {
  fn main<R: Runtime>(
    app_handle: AppHandle<R>,
    path: String,
    bin_size: f32,
  ) -> Result<Vec<f32>, AnyhowError> {
    let cache_dir = app_handle.app_handle().path().app_cache_dir()?;
    println!("cache_dir: {:?}", cache_dir);

    let cache_path = build_cache_path(&path, &cache_dir);
    if let Ok(cached_waveform) = std::fs::read(&cache_path) {
      return serde_json::from_slice(&cached_waveform).context("failed to parse cached waveform");
    }

    let src = std::fs::File::open(&path).context("failed to open media")?;

    let mss = MediaSourceStream::new(Box::new(src), Default::default());

    let ext = get_extension_from_filename(&path).context("failed to get extension")?;
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
      .context("unsupported format")?;
    let mut format = probed.format;

    let track = format
      .tracks()
      .iter()
      .find(|t| t.codec_params.codec != CODEC_TYPE_NULL)
      .context("no supported audio tracks")?;

    let dec_opts: DecoderOptions = Default::default();

    let mut decoder = symphonia::default::get_codecs()
      .make(&track.codec_params, &dec_opts)
      .context("unsupported codec")?;

    let track_id = track.id;

    let mut all_samples: Vec<f32> = Vec::with_capacity(bin_size as usize);

    loop {
      let packet = match format.next_packet() {
        Ok(packet) => packet,
        Err(Error::ResetRequired) => {
          return Err(anyhow!("reset required"));
        }
        Err(Error::IoError(_)) => break,
        Err(err) => {
          return Err(anyhow!("failed to get next packet: {}", err));
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
        Err(Error::IoError(_)) => {
          continue;
        }
        Err(Error::DecodeError(_)) => {
          continue;
        }
        Err(err) => {
          return Err(anyhow!("failed to decode packet: {}", err));
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

    std::fs::write(
      &cache_path,
      serde_json::to_vec(&waveform_data).context("failed to serialize waveform")?,
    )
    .context("failed to write waveform to cache")?;

    Ok(waveform_data)
  }

  return main(app_handle, path, bin_size).map_err(|e| e.to_string());
}

fn get_extension_from_filename(filename: &str) -> Result<&str, AnyhowError> {
  Path::new(filename)
    .extension()
    .and_then(OsStr::to_str)
    .ok_or(anyhow!("failed to get extension"))
}

fn build_cache_path(file_path: &str, cache_dir: &Path) -> String {
  let hash = format!("{:x}", md5::compute(file_path));
  return cache_dir
    .join(format!("{}-wf.json", hash))
    .to_string_lossy()
    .to_string();
}
