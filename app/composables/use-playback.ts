// higher = more accurate, more resource intensive
// ~150 should be max
const TIMESTAMP_INTERVAL = 50

export const usePlayback = createSharedComposable(() => {
  const { rpc } = useTauri()

  // internal
  const _playbackStatus = ref<StreamStatus | null>(null)
  const _currentTrack = shallowRef<FileEntry | null>(null)
  // public
  const playbackStatus = readonly(_playbackStatus)
  const currentTrack = readonly(_currentTrack)

  const { pause: pauseDurationTimer, resume: resumeDurationTimer } = useTimestamp({
    callback: () => {
      if (!_playbackStatus.value)
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

  async function playPauseCurrentTrack(action: 'Resume' | 'Pause') {
    const status = await rpc.control_playback(action)
    _playbackStatus.value = status
    return action === 'Pause' ? pauseDurationTimer() : resumeDurationTimer()
  }

  async function playTrack(path: string) {
    const data = await getTrackData(path)
    _currentTrack.value = data

    const status = await rpc.control_playback({
      Play: path,
    })
    _playbackStatus.value = {
      ...status,

      // compensate for tiny audio driver delay
      position: status.position - 50,
    }
    resumeDurationTimer()
  }

  function setLoop(loop: boolean) {
    rpc.control_playback({
      SetLoop: loop,
    }).then(status => _playbackStatus.value = status)
  }

  async function seekCurrentTrack(to: number) {
    if (!_playbackStatus.value)
      return

    const _status = await rpc.control_playback({
      Seek: to,
    })

    _playbackStatus.value = {
      ..._playbackStatus.value,
      position: to,
    }
  }

  async function getTrackData(path: string) {
    return await rpc.get_track_data(path)
  }

  return {
    currentTrack,
    playbackStatus,
    playPauseCurrentTrack,
    playTrack,
    seekCurrentTrack,
    setLoop,
  }
})
