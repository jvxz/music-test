import { sql } from 'kysely'

export function useUserPlaylists() {
  const router = useRouter()
  const route = useRoute()
  const { addTracksToLibrary } = useLibrary()
  const { getTrackData } = useTrackData()

  const { data: playlists, refresh: refreshPlaylistList } = useAsyncData<Selectable<DB['playlists']>[]>('playlists', () => $db().selectFrom('playlists').selectAll().execute(), {
    default: () => [],
    immediate: true,
  })

  async function createPlaylist(opts: { name: string }) {
    await $db().insertInto('playlists').values({
      name: opts.name,
    }).returningAll().executeTakeFirstOrThrow()

    refreshPlaylistList()
  }

  async function renamePlaylist(playlistId: number, name: string) {
    await $db().updateTable('playlists').set({
      name,
    }).where('id', '=', playlistId).execute()

    refreshPlaylistList()
    refreshTrackListForType('playlist', String(playlistId))
  }

  async function deletePlaylist(playlistId: number) {
    await $db().deleteFrom('playlists').where('id', '=', playlistId).execute()

    if ('id' in route.params && Number(route.params.id) === playlistId)
      router.back()

    refreshPlaylistList()
  }

  async function getPlaylistTracks(playlistId: number): Promise<PlaylistEntry[]> {
    const playlistTracks = await $db()
      .selectFrom('playlist_tracks')
      .where('playlist_id', '=', playlistId)
      .selectAll()
      .orderBy('position', 'asc')
      .execute()

    const fileEntries: PlaylistEntry[] = await Promise.all(playlistTracks.map(async (track) => {
      const trackData = await getTrackData(track.path)
      return {
        ...trackData,
        ...track,
        is_playlist_track: true,
      } satisfies PlaylistEntry
    }),
    )

    return fileEntries
  }

  async function addToPlaylist(playlistId: number, tracks: FileEntry[]) {
    const validTracks = tracks.filter(track => track.valid)
    if (!validTracks.length) {
      return emitError({
        data: 'No valid tracks to add to the playlist. Did you select any tracks?',
        type: 'Other',
      })
    }

    const invalidTracks = tracks.filter(track => !track.valid)
    if (invalidTracks.length) {
      emitError({
        data: `Could not add the following tracks to the playlist: ${invalidTracks.map(track => track.path).join(', ')}`,
        type: 'FileSystem',
      })
    }

    const libraryTracks = await addTracksToLibrary(validTracks, {
      id: String(playlistId),
      type: 'playlist',
    })

    await $db().insertInto('playlist_tracks').values(libraryTracks.map((track, idx) => ({
      name: track.filename,
      path: track.path,
      playlist_id: playlistId,
      position: eb => eb
        .selectFrom('playlist_tracks')
        .select(eb =>
          sql<number>`${eb.fn.coalesce(
            eb.fn.max('position'),
            eb.val(0),
          )} + 1 + ${idx}`.as('pos'),
        )
        .where('playlist_id', '=', playlistId)
        .limit(1),
      track_id: track.id,
    })),
    ).execute()

    refreshPlaylistList()
    refreshTrackListForType('playlist', String(playlistId))
  }

  // TODO: allow multiple tracks
  async function removeFromPlaylist(tracks: PlaylistEntry[]) {
    const playlistId = tracks[0]?.playlist_id

    if (!playlistId) {
      return emitError({
        data: 'Attempted to remove tracks from an unknown playlist',
        type: 'Other',
      })
    }

    if (playlistId && tracks.some(track => track.playlist_id !== playlistId)) {
      return emitError({
        data: 'Attempted to remove tracks from multiple playlists',
        type: 'Other',
      })
    }

    await $db()
      .deleteFrom('playlist_tracks')
      .where('playlist_id', '=', playlistId)
      .where('track_id', 'in', tracks.map(track => track.track_id))
      .execute()

    refreshPlaylistList()
    refreshTrackListForType('playlist', String(playlistId))
    refreshTrackListForType('library')
  }

  async function checkPlaylistExists(playlistId: number) {
    const playlist = await $db()
      .selectFrom('playlists')
      .where('id', '=', playlistId)
      .selectAll()
      .executeTakeFirst()
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
