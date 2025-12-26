export const usePlayback = createSharedComposable(() => {
  const { prefs, rpc, store } = useTauri()

  // internal
  const _playbackStatus = ref<StreamStatus | null>(prefs.get('playback-status') as StreamStatus | null)
  const _currentTrack = shallowRef<TrackListEntry | null>(prefs.get('current-track') as TrackListEntry | null)

  // public
  const playbackStatus = readonly(_playbackStatus)
  const currentTrack = readonly(_currentTrack)

  let lastTimestamp = performance.now()
  const { pause: pauseDurationTimer, resume: resumeDurationTimer } = useRafFn(() => {
    if (!_playbackStatus.value || !_playbackStatus.value.is_playing)
      return

    const currentTimestamp = performance.now()
    const deltaTime = currentTimestamp - lastTimestamp
    lastTimestamp = currentTimestamp

    _playbackStatus.value.position = Math.max(0, _playbackStatus.value?.position + (deltaTime / 1000))
  })

  watch(() => _playbackStatus.value?.is_playing, (isPlaying) => {
    if (isPlaying) {
      lastTimestamp = performance.now()
      resumeDurationTimer()
    }
    else { pauseDurationTimer() }
  })

  watch(() => _playbackStatus.value?.position, () => {
    if (_playbackStatus.value?.position && _playbackStatus.value?.position >= _playbackStatus.value?.duration) {
      _playbackStatus.value.position = 0
      if (!_playbackStatus.value?.is_looping) {
        _playbackStatus.value.is_playing = false
        _playbackStatus.value.path = null

        _currentTrack.value = null
      }
    }
  })

  async function playPauseCurrentTrack(action?: 'Resume' | 'Pause') {
    if (!action) {
      action = _playbackStatus.value?.is_playing ? 'Pause' : 'Resume'
    }

    _playbackStatus.value = await rpc.control_playback(action)
  }

  async function playTrack(entry: TrackListEntry) {
    const data = await getTrackData(entry)
    _currentTrack.value = data

    const status = await rpc.control_playback({
      Play: entry.path,
    })
    _playbackStatus.value = status
    resumeDurationTimer()
  }

  async function setLoop(loop: boolean) {
    await rpc.control_playback({
      SetLoop: loop,
    })

    if (_playbackStatus.value) {
      _playbackStatus.value.is_looping = loop
    }
  }

  async function seekCurrentTrack(to: number) {
    if (!_playbackStatus.value)
      return

    const _status = await rpc.control_playback({
      Seek: to,
    })
    _playbackStatus.value = _status
  }

  async function setVolume(volume: number) {
    if (_playbackStatus.value?.is_muted) {
      toggleMute()
    }

    await rpc.control_playback({
      SetVolume: volume,
    })

    if (_playbackStatus.value) {
      _playbackStatus.value.volume = volume
    }
  }

  async function toggleMute() {
    await rpc.control_playback('ToggleMute')

    if (_playbackStatus.value) {
      _playbackStatus.value.is_muted = !_playbackStatus.value.is_muted
    }
  }

  async function getTrackData(entry: TrackListEntry): Promise<TrackListEntry | null> {
    const res = await rpc.get_track_data(entry.path)
    if (!res)
      return null

    return {
      ...res,
      ...entry,
    }
  }

  watchDebounced(_playbackStatus, () => store.set('playback-status', _playbackStatus.value), { debounce: 500 })
  watchDebounced(currentTrack, () => store.set('current-track', currentTrack.value), { debounce: 500 })

  return {
    currentTrack,
    playbackStatus,
    playPauseCurrentTrack,
    playTrack,
    seekCurrentTrack,
    setLoop,
    setVolume,
    toggleMute,
  }
})
