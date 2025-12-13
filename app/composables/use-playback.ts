interface PlayerState {
  loop: 'single' | 'playlist' | false
  shuffle: boolean
}

export const usePlayback = createSharedComposable(() => {
  const { rpc } = useTauri()

  // internal
  const _playbackStatus = ref<StreamStatus | null>(null)
  // public
  const playbackStatus = readonly(_playbackStatus)

  const playerState = ref<PlayerState>({
    loop: 'single',
    shuffle: false,
  })

  watchEffect(() => {
    console.log('playerState', playerState.value)
    console.log('playbackStatus', playbackStatus.value)
  })

  function playTrack(path: string) {
    rpc.control_playback({
      Play: path,
    }).then(status => _playbackStatus.value = status)
  }

  function setLoop(loop: boolean) {
    rpc.control_playback({
      SetLoop: loop,
    }).then(status => _playbackStatus.value = status)
  }

  return {
    playbackStatus,
    playTrack,
    setLoop,
  }
})
