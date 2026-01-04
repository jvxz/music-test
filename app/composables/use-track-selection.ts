export const useTrackSelection = createSharedComposable(() => {
  const selectedTrack = ref<TrackListEntry | null>(null)

  return {
    selectedTrack,
  }
})
