export const usePlayingTrack = createSharedComposable(() => {
  const { rpc } = useTauri()
  const playingTrack = ref<FileEntry | null>(null)

  function playTrack(track: FileEntry) {
    playingTrack.value = track
  }

  watch(playingTrack, (newVal) => {
    if (newVal) {
      rpc.play_track(newVal.path)
    }
  })

  return {
    playingTrack,
    playTrack,
  }
})
