export const usePlayback = createSharedComposable(() => {
  const { rpc } = useTauri()
  const playbackStatus = ref<StreamStatus | null>(null)

  watch(playbackStatus, (status) => {
    console.log('playbackStatus', status)
  })

  const playTrack = (path: string) => {
    rpc.control_playback({
      Play: path,
    }).then((status) => {
      playbackStatus.value = status
    })
  }

  return {
    playTrack,
  }
})
