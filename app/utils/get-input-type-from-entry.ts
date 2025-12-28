export const getInputTypeFromEntry = createUnrefFn((entry: TrackListEntry) => {
  if (entry.is_playlist_track) {
    return 'playlist'
  }

  return 'folder'
})
