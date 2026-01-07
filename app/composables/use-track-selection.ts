type SelectedTrack = Prettify<TrackListEntry & {
  selectedFrom: TrackListInput
}>

export const useTrackSelection = createSharedComposable(() => {
  const selectedTracks = ref<SelectedTrack[]>([])

  function editTrackSelection(shouldSelect: 'select' | 'deselect', entry: TrackListEntry, manualInput?: TrackListInput) {
    const input = manualInput ?? useTrackListInput().value
    const entryToEdit = makeSelectableTrack(entry, input)

    if (shouldSelect === 'select') {
      if (checkIsSelected(entry))
        return

      selectedTracks.value.push(entryToEdit)
    }
    else {
      selectedTracks.value = selectedTracks.value.filter((entry) => {
        if (entry.is_playlist_track && entryToEdit.is_playlist_track) {
          return entry.position !== entryToEdit.position
        }
        else {
          return entry.path !== entryToEdit.path
        }
      })
    }
  }

  function checkIsSelected(entry: TrackListEntry, manualInput?: TrackListInput) {
    const input = manualInput ?? useTrackListInput().value
    const selectableTrack = makeSelectableTrack(entry, input)

    const idx = selectedTracks.value.findIndex((entry) => {
      if (entry.is_playlist_track && selectableTrack.is_playlist_track) {
        return entry.position === selectableTrack.position
      }
      else {
        return entry.path === selectableTrack.path
      }
    })

    return idx >= 0
  }

  function clearSelectedTracks() {
    if (selectedTracks.value.length) {
      selectedTracks.value = []
    }
  }

  const router = useRouter()
  router.beforeEach(() => {
    clearSelectedTracks()
  })

  return {
    checkIsSelected,
    clearSelectedTracks,
    editTrackSelection,
    selectedTracks,
  }
})

function makeSelectableTrack(entry: TrackListEntry, manualInput?: TrackListInput): SelectedTrack {
  const input = manualInput ?? useTrackListInput().value

  return {
    ...entry,
    selectedFrom: input,
  }
}
