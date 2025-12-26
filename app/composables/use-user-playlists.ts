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

  async function renamePlaylist(playlistId: number, name: string) {
    await $db().updateTable('playlists').set({
      name,
    }).where('id', '=', playlistId).execute()

    refreshPlaylistList()
    refreshTrackListForPlaylist(playlistId)
  }

  async function deletePlaylist(playlistId: number) {
    await $db().deleteFrom('playlists').where('id', '=', playlistId).execute()

    refreshTrackListForPlaylist(playlistId)
    refreshPlaylistList()
  }

  async function getPlaylistTracks(playlistId: number): Promise<PlaylistEntry[]> {
    const playlistTracks = await $db().selectFrom('playlist_tracks').where('playlist_id', '=', playlistId).selectAll().execute()
    const fileEntries: (PlaylistEntry | null)[] = await Promise.all(playlistTracks.map(async (track) => {
      const fileEntry = await useTauri().rpc.get_track_data(track.path)
      if (!fileEntry)
        return null

      return {
        ...fileEntry,
        added_at: track.added_at,
        id: track.id,
        is_playlist_track: true,
        playlist_id: track.playlist_id,
      }
    }))

    return fileEntries.filter(Boolean) as PlaylistEntry[]
  }

  async function addToPlaylist(playlistId: number, tracks: FileEntry[]) {
    await $db().insertInto('playlist_tracks').values(tracks.map(track => ({
      name: track.name,
      path: track.path,
      playlist_id: playlistId,
    }))).execute()

    refreshPlaylistList()
    refreshTrackListForPlaylist(playlistId)
  }

  async function removeFromPlaylist(playlistId: number, trackId: number) {
    await $db().deleteFrom('playlist_tracks').where('playlist_id', '=', playlistId).where('id', '=', trackId).execute()

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
    removeFromPlaylist,
    renamePlaylist,
  }
}
