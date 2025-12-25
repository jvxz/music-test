export function useUserPlaylists() {
  const { data: playlists, refresh: refreshPlaylistList } = useAsyncData<Selectable<DB['playlists']>[]>('playlists', () => $db().selectFrom('playlists').selectAll().execute(), {
    default: () => [],
    immediate: true,
  })

  async function createPlaylist(opts: { name: string }) {
    const playlist = await $db().insertInto('playlists').values({
      name: opts.name,
    }).returningAll().executeTakeFirstOrThrow()

    refreshPlaylistList()
    refreshTrackListForPlaylist(playlist.id)
  }

  function renamePlaylist(playlistId: number, name: string) {
    $db().updateTable('playlists').set({
      name,
    }).where('id', '=', playlistId).execute()

    refreshPlaylistList()
    refreshTrackListForPlaylist(playlistId)
  }

  function deletePlaylist(playlistId: number) {
    $db().deleteFrom('playlists').where('id', '=', playlistId).execute()

    refreshTrackListForPlaylist(playlistId)
    refreshPlaylistList()
  }

  async function getPlaylistTracks(playlistId: number) {
    const playlistTracks = await $db().selectFrom('playlist_tracks').where('playlist_id', '=', playlistId).selectAll().execute()
    const fileEntries = await Promise.all(playlistTracks.map(async (track) => {
      const fileEntry = await useTauri().rpc.get_track_data(track.path)
      return fileEntry
    }).filter(Boolean))
    return fileEntries as FileEntry[]
  }

  function addToPlaylist(playlistId: number, tracks: FileEntry[]) {
    $db().insertInto('playlist_tracks').values(tracks.map(track => ({
      name: track.name,
      path: track.path,
      playlist_id: playlistId,
    }))).execute()

    refreshPlaylistList()
    refreshTrackListForPlaylist(playlistId)
  }

  function getPlaylistName(playlistId: number) {
    return playlists.value.find(playlist => playlist.id === playlistId)?.name
  }

  return {
    addToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistName,
    getPlaylistTracks,
    playlists,
    renamePlaylist,
  }
}
