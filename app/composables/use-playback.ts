// higher = more accurate, more resource intensive
// ~150 should be max
const TIMESTAMP_INTERVAL = 50

export const usePlayback = createSharedComposable(() => {
  const { prefs, rpc, store } = useTauri()

  // internal
  const _playbackStatus = ref<StreamStatus | null>(prefs.get('playback-status') as StreamStatus | null)
  const _currentTrack = shallowRef<FileEntry | null>(prefs.get('current-track') as FileEntry | null)

  // public
  const playbackStatus = readonly(_playbackStatus)
  const currentTrack = readonly(_currentTrack)

  const { pause: pauseDurationTimer, resume: resumeDurationTimer } = useTimestamp({
    callback: () => {
      if (!_playbackStatus.value || !_playbackStatus.value.is_playing)
        return

      _playbackStatus.value.position = Math.max(0, _playbackStatus.value?.position + (TIMESTAMP_INTERVAL / 1000))
    },
    controls: true,
    immediate: true,
    interval: TIMESTAMP_INTERVAL,
  })

  // resume/pause timestamp tracking when playback status changes to save resources
  watch(() => _playbackStatus.value?.is_playing, isPlaying => isPlaying ? resumeDurationTimer() : pauseDurationTimer())

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

  async function playTrack(path: string) {
    const data = await getTrackData(path)
    _currentTrack.value = data

    const status = await rpc.control_playback({
      Play: path,
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

  async function getTrackData(path: string) {
    return await rpc.get_track_data(path)
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
