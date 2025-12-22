export function useUserPlaylists() {
  const { data: playlists, refresh: refreshPlaylists } = useAsyncData<Selectable<DB['playlists']>[]>('playlists', () => $db().selectFrom('playlists').selectAll().execute(), {
    default: () => [],
    immediate: true,
  })

  function createPlaylist(opts: { name: string }) {
    $db().insertInto('playlists').values({
      name: opts.name,
    }).execute()

    refreshPlaylists()
  }

  function renamePlaylist(playlistId: number, name: string) {
    $db().updateTable('playlists').set({
      name,
    }).where('id', '=', playlistId).execute()

    refreshPlaylists()
  }

  function deletePlaylist(playlistId: number) {
    $db().deleteFrom('playlists').where('id', '=', playlistId).execute()

    refreshPlaylists()
  }

  async function getPlaylistTracks(playlistId: number) {
    const playlistTracks = await $db().selectFrom('playlist_tracks').where('playlist_id', '=', playlistId).selectAll().execute()
    const fileEntries = await Promise.all(playlistTracks.map(async (track) => {
      const fileEntry = await useTauri().rpc.get_track_data(track.path)
      return fileEntry
    }).filter(Boolean))
    return fileEntries as FileEntry[]
  }

  function addTrackToPlaylist(playlistId: number, track: FileEntry) {
    $db().insertInto('playlist_tracks').values({
      name: track.name,
      path: track.path,
      playlist_id: playlistId,
    }).execute()

    refreshPlaylists()
  }

  return {
    addTrackToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistTracks,
    playlists,
    renamePlaylist,
  }
}
