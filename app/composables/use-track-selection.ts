interface SelectedTrackData {
  selectedFrom: TrackListInput
  entries: TrackListEntry[]
}

export const useTrackSelection = createSharedComposable(() => {
  const trackListInput = useTrackListInput()
  const selectedTrackData = ref<SelectedTrackData>({
    entries: [],
    selectedFrom: trackListInput.value,
  })

  function editTrackSelection(shouldSelect: 'select' | 'deselect', entry: TrackListEntry) {
    const entryToEdit = entry

    if (shouldSelect === 'select') {
      if (checkIsSelected(entry))
        return

      selectedTrackData.value.entries.push(entryToEdit)
    }
    else {
      selectedTrackData.value.entries = selectedTrackData.value.entries.filter((entry) => {
        if (entry.is_playlist_track && entryToEdit.is_playlist_track)
          return entry.position !== entryToEdit.position

        else
          return entry.path !== entryToEdit.path
      })
    }
  }

  function checkIsSelected(entryToCheck: TrackListEntry) {
    const idx = selectedTrackData.value.entries.findIndex((entry) => {
      if (entry.is_playlist_track && entryToCheck.is_playlist_track)
        return entry.position === entryToCheck.position

      else
        return entry.path === entryToCheck.path
    })

    return idx >= 0
  }

  function clearSelectedTracks() {
    if (selectedTrackData.value.entries.length)
      selectedTrackData.value.entries = []
  }

  const router = useRouter()
  router.beforeEach(() => {
    clearSelectedTracks()
  })

  return {
    checkIsSelected,
    clearSelectedTracks,
    editTrackSelection,
    selectedTrackData,
  }
})
