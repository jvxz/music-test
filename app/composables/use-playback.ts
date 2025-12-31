export const usePlayback = createSharedComposable(() => {
  const { prefs, rpc, store } = useTauri()
  const { scrobbleTrack, updateNowPlaying } = useLastFm()

  // internal
  const _playbackStatus = ref<StreamStatus | null>(prefs.get('playback-status') as StreamStatus | null)
  const _currentTrack = shallowRef<CurrentPlayingTrack | null>(prefs.get('current-track') as CurrentPlayingTrack | null)

  // public
  const playbackStatus = readonly(_playbackStatus)
  const currentTrack = readonly(_currentTrack)

  let timeListenedMs = 0
  let hasScrobbled = false
  const canScrobble = () => {
    if (!_playbackStatus.value?.position)
      return false

    const hasListenedForHalf = timeListenedMs / 1000 >= Math.floor(_playbackStatus.value.duration / 2)
    const hasListenedFor30s = timeListenedMs / 1000 >= 30
    const hasListenedFor4m = timeListenedMs / 1000 >= 4 * 60

    const hasListenedForEnough = ((hasListenedForHalf && hasListenedFor30s) || hasListenedFor4m)
    const isLongEnough = _playbackStatus.value.duration >= 30

    return hasListenedForEnough && isLongEnough && !hasScrobbled
  }

  let lastTimestamp = performance.now()
  const { pause: pauseDurationTimer, resume: resumeDurationTimer } = useRafFn(() => {
    if (!_playbackStatus.value || !_playbackStatus.value.is_playing)
      return

    const currentTimestamp = performance.now()
    const deltaTime = currentTimestamp - lastTimestamp
    lastTimestamp = currentTimestamp

    _playbackStatus.value.position = Math.max(0, _playbackStatus.value?.position + (deltaTime / 1000))
    timeListenedMs += deltaTime
  })

  watch(() => _playbackStatus.value?.is_playing, (isPlaying) => {
    if (isPlaying) {
      lastTimestamp = performance.now()
      resumeDurationTimer()
    }
    else {
      pauseDurationTimer()
    }
  })

  watch(() => _playbackStatus.value?.position, async () => {
    if (!_currentTrack.value || !_playbackStatus.value?.position)
      return

    if (_playbackStatus.value.position >= _playbackStatus.value.duration) {
      // track finished, reset position & scrobble if not already scrobbled
      if (canScrobble()) {
        await scrobbleTrack(_currentTrack.value, _playbackStatus.value.duration)
        hasScrobbled = true
        // await to prevent race condition
        await nextTick()
      }
      _playbackStatus.value.position = 0

      // if not looping, stop playback & reset current track
      if (!_playbackStatus.value?.is_looping) {
        _playbackStatus.value.is_playing = false
        _playbackStatus.value.path = null

        _currentTrack.value = null
      }
      else {
        // if looping, reset hasScrobbled & refresh now playing
        hasScrobbled = false
        timeListenedMs = 0
        updateNowPlaying(_currentTrack.value, _playbackStatus.value.duration)
      }
    }
  })

  async function playPauseCurrentTrack(action?: 'Resume' | 'Pause') {
    // scrobble current track if not already scrobbled & applicable
    if (_currentTrack.value && _playbackStatus.value && canScrobble()) {
      await scrobbleTrack(_currentTrack.value, _playbackStatus.value.duration)
      hasScrobbled = true
    }

    if (!action) {
      action = _playbackStatus.value?.is_playing ? 'Pause' : 'Resume'
    }

    _playbackStatus.value = await rpc.control_playback(action)
  }

  async function playTrack(entry: TrackListEntry) {
    // scrobble previous track if not already scrobbled
    if (_currentTrack.value && _playbackStatus.value && canScrobble()) {
      await scrobbleTrack(_currentTrack.value, _playbackStatus.value.duration)
    }

    const data = await getTrackData(entry)
    if (!data)
      return

    _currentTrack.value = {
      ...data,
      playback_source: getInputTypeFromEntry(entry),
      playback_source_id: entry.path,
    }

    const status = await rpc.control_playback({
      Play: entry.path,
    })
    _playbackStatus.value = status

    timeListenedMs = 0
    hasScrobbled = false
    resumeDurationTimer()

    await updateNowPlaying(_currentTrack.value, _playbackStatus.value.duration)
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
