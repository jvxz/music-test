export const useTrackSelection = createSharedComposable(() => {
  const selectedTrack = ref<PotentialFileEntry | null>(null)

  return {
    selectedTrack,
  }
})
