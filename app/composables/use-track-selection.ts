type SelectedTrack = Prettify<TrackListEntry & {
  selectedFrom: TrackListInput
}>

export const useTrackSelection = createSharedComposable(() => {
  const selectedTrack = shallowRef<SelectedTrack | null>(null)

  function setSelectedTrack(entry: TrackListEntry, manualInput?: TrackListInput) {
    const input = manualInput ?? useTrackListInput().value

    if (checkIsSelected(entry, input)) {
      return
    }

    selectedTrack.value = {
      ...entry,
      selectedFrom: input,
    }
  }

  function checkIsSelected(entry: TrackListEntry, manualInput?: TrackListInput) {
    const input = manualInput ?? useTrackListInput().value
    return selectedTrack.value?.selectedFrom === input && selectedTrack.value?.path === entry.path
  }

  function clearSelectedTrack() {
    selectedTrack.value = null
  }

  const router = useRouter()
  router.beforeEach(() => {
    clearSelectedTrack()
  })

  return {
    checkIsSelected,
    clearSelectedTrack,
    selectedTrack,
    setSelectedTrack,
  }
})
