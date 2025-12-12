interface PlayerState {
  loop: 'single' | 'playlist' | false
  shuffle: boolean
}

export const usePlayback = createSharedComposable(() => {
  const { rpc } = useTauri()
  const playbackStatus = ref<StreamStatus | null>(null)
  const playerState = ref<PlayerState>({
    loop: 'single',
    shuffle: false,
  })
  // const queue = ref<[]>([])

  watchEffect(() => {
    console.log('playerState', playerState.value)
    console.log('playbackStatus', playbackStatus.value)
  })

  const playTrack = (path: string) => {
    console.log('playing', playerState.value.loop === 'single')
    rpc.control_playback({
      Play: [path, playerState.value.loop === 'single'],
    }).then((status) => {
      playbackStatus.value = status
    })
  }

  return {
    playTrack,
  }
})
