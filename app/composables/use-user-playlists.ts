export function useUserPlaylists() {
  const { execute: refreshPlaylists, state: playlists } = useAsyncState<Selectable<DB['playlists']>[]>(() => $db().selectFrom('playlists').selectAll().execute(), [], {
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

  return {
    createPlaylist,
    deletePlaylist,
    playlists,
    renamePlaylist,
  }
}
