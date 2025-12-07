export const useTrackSelection = createSharedComposable(() => {
  const selectedTrack = ref<FileEntry | null>(null)

  return {
    selectedTrack,
  }
})
