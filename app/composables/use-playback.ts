interface PlayerState {
  loop: 'single' | 'playlist' | false
  shuffle: boolean
}

// higher = more accurate, more resource intensive
// ~150 should be max
const SEEK_UPDATE_INTERVAL = 50

export const usePlayback = createSharedComposable(() => {
  const { rpc } = useTauri()

  // internal
  const _playbackStatus = ref<StreamStatus | null>(null)
  const _currentTrack = shallowRef<FileEntry | null>(null)
  // public
  const playbackStatus = readonly(_playbackStatus)
  const currentTrack = readonly(_currentTrack)

  // timestamp for when the playback status position was last updated
  const playLastChanged = ref(0)
  const { pause, resume } = useTimestamp({
    callback: (timestamp) => {
      if (!playLastChanged.value || !_playbackStatus.value || !_playbackStatus.value?.is_playing)
        return

      const dur = playbackStatus.value?.duration ?? 0
      // compensate for tiny delay when sending rpc request
      const elapsed = Math.max(0, ((timestamp - playLastChanged.value - 150) / 1000))

      if (elapsed >= dur) {
        _playbackStatus.value.is_playing = false
      }
      else {
        _playbackStatus.value.position = elapsed
      }
    },
    controls: true,
    interval: SEEK_UPDATE_INTERVAL,
  })

  // resume/pause timestamp tracking when playback status changes to save resources
  watch(() => _playbackStatus.value?.is_playing, isPlaying => isPlaying ? resume() : pause())

  const _playerState = ref<PlayerState>({
    loop: 'single',
    shuffle: false,
  })

  async function playTrack(path: string) {
    const data = await getTrackData(path)
    _currentTrack.value = data

    const status = await rpc.control_playback({
      Play: path,
    })
    _playbackStatus.value = status
    playLastChanged.value = Date.now()
    resume()
  }

  function setLoop(loop: boolean) {
    rpc.control_playback({
      SetLoop: loop,
    }).then(status => _playbackStatus.value = status)
  }

  async function getTrackData(path: string) {
    return await rpc.get_track_data(path)
  }

  return {
    currentTrack,
    playbackStatus,
    playTrack,
    setLoop,
  }
})
