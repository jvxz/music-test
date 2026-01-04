export function useUserPlaylists() {
  const router = useRouter()
  const route = useRoute()
  const { addTracksToLibrary, cleanupLibraryTrackSource } = useLibrary()

  const { data: playlists, refresh: refreshPlaylistList } = useAsyncData<Selectable<DB['playlists']>[]>('playlists', () => $db().selectFrom('playlists').selectAll().execute(), {
    default: () => [],
    immediate: true,
  })

  async function createPlaylist(opts: { name: string }) {
    await $db().insertInto('playlists').values({
      name: opts.name,
    }).returningAll().executeTakeFirstOrThrow()

    refreshPlaylistList()
    refreshTrackListForType('playlist')
  }

  async function renamePlaylist(playlistId: number, name: string) {
    await $db().updateTable('playlists').set({
      name,
    }).where('id', '=', playlistId).execute()

    refreshPlaylistList()
    refreshTrackListForType('playlist')
  }

  async function deletePlaylist(playlistId: number) {
    await $db().deleteFrom('playlists').where('id', '=', playlistId).execute()

    if ('id' in route.params && Number(route.params.id) === playlistId) {
      router.back()
    }

    refreshTrackListForType('playlist')
    refreshPlaylistList()
  }

  async function getPlaylistTracks(playlistId: number): Promise<PlaylistEntry[]> {
    const playlistTracks = await $db().selectFrom('playlist_tracks').where('playlist_id', '=', playlistId).selectAll().execute()
    const fileEntries: PotentialFileEntry[] = await Promise.all(playlistTracks.map(async (track) => {
      const fileEntry = await useTauri().rpc.get_track_data(track.path)
      if (!fileEntry) {
        return {
          ...track,
          is_playlist_track: true,
          name: track.name,
          path: track.path,
          valid: false,
        } as InvalidFileEntry
      }

      return {
        ...fileEntry,
        added_at: track.added_at,
        id: track.id,
        is_playlist_track: true,
        playlist_id: track.playlist_id,
        valid: true,
      }
    }))

    return fileEntries.filter(Boolean) as PlaylistEntry[]
  }

  async function addToPlaylist(playlistId: number, tracks: FileEntry[]) {
    await addTracksToLibrary(tracks, {
      id: String(playlistId),
      type: 'playlist',
    })

    await $db().insertInto('playlist_tracks').values(tracks.map(track => ({
      name: track.name,
      path: track.path,
      playlist_id: playlistId,
    }))).execute()

    refreshPlaylistList()
    refreshTrackListForType('playlist', String(playlistId))
  }

  // TODO: allow multiple tracks
  async function removeFromPlaylist(playlistId: number, track: PlaylistEntry) {
    await $db().deleteFrom('playlist_tracks').where('playlist_id', '=', playlistId).where('id', '=', track.id).execute()

    await cleanupLibraryTrackSource(track)

    refreshPlaylistList()
    refreshTrackListForType('playlist', String(playlistId))
  }

  async function checkPlaylistExists(playlistId: number) {
    const playlist = await $db().selectFrom('playlists').where('id', '=', playlistId).selectAll().executeTakeFirst()
    return playlist !== undefined
  }

  function getPlaylistName(playlistId: number) {
    return playlists.value.find(playlist => playlist.id === playlistId)?.name
  }

  return {
    addToPlaylist,
    checkPlaylistExists,
    createPlaylist,
    deletePlaylist,
    getPlaylistName,
    getPlaylistTracks,
    playlists,
    removeFromPlaylist,
    renamePlaylist,
  }
}
