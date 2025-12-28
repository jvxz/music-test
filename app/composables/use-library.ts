export function useLibrary() {
  const { rpc } = useTauri()

  async function getLibraryTracks() {
    const tracks = await $db().selectFrom('library_tracks').selectAll().execute()

    const fileEntries = await rpc.get_tracks_data(tracks.map(track => track.path))
    const folderEntries: FolderEntry[] = fileEntries.map(entry => ({
      ...entry,
      is_playlist_track: false,
    }))

    return folderEntries
  }

  const { execute: addFolderToLibrary, isLoading: isAddingFolderToLibrary } = useAsyncState<void>(async (folderPath: string) => {
    const isFolder = await useTauriFsExists(folderPath)
    if (!isFolder)
      // TODO: show error toast
      return

    await $db().insertInto('library_folders').values({
      path: folderPath,
    }).execute()

    const folderTracks = await rpc.read_folder(folderPath)

    await addTracksToLibrary(folderTracks, {
      id: folderPath,
      type: 'folder',
    })

    refreshNuxtData(buildFolderInLibraryKey(folderPath))
    refreshTrackListForType('library')
  }, void 0, { immediate: false })

  const { execute: removeFolderFromLibrary, isLoading: isRemovingFolderFromLibrary } = useAsyncState<void>(async (folderPath: string) => {
    const folderTracksSources = await $db()
      .selectFrom('library_tracks_source')
      .where('source_type', '=', 'folder')
      .where('source_id', '=', folderPath)
      .selectAll()
      .execute()

    await $db()
      .deleteFrom('library_tracks_source')
      .where('source_type', '=', 'folder')
      .where('source_id', '=', folderPath)
      .execute()

    const libraryTracksSources = await $db()
      .selectFrom('library_tracks_source')
      .where('source_id', 'is not', folderPath)
      .where('track_id', 'in', folderTracksSources.map(source => source.track_id))
      .selectAll()
      .execute()

    const tracksToDelete = folderTracksSources.filter(source => !libraryTracksSources.some(s => s.track_id === source.track_id))

    await $db()
      .deleteFrom('library_tracks')
      .where('id', 'in', tracksToDelete.map(source => source.track_id))
      .execute()

    await $db()
      .deleteFrom('library_folders')
      .where('path', '=', folderPath)
      .execute()

    clearNuxtData(buildFolderInLibraryKey(folderPath))
    refreshTrackListForType('library')
  }, void 0, { immediate: false })

  const useFolderInLibrary = (folderPath: string) => useAsyncData(computed(() => buildFolderInLibraryKey(folderPath)), () => {
    return $db().selectFrom('library_folders').where('path', '=', folderPath).selectAll().executeTakeFirst()
  }, { immediate: false })

  async function addTracksToLibrary(tracks: FileEntry[], source: {
    type: 'folder' | 'playlist'
    id: string
  }) {
    await $db()
      .insertInto('library_tracks')
      .values(tracks.map(track => ({
        album: track.tags.TALB ?? null,
        artist: track.tags.TPE1 ?? null,
        filename: track.name,
        path: track.path,
        title: track.tags.TIT2 ?? null,
      })))
      .onConflict(conflict => conflict.doNothing())
      .returningAll()
      .execute()

    // get existing library tracks instead of returning from the first call because if a
    // conflict is found then the corresponding track will not be in the returning array
    const existingLibraryTracks = await $db()
      .selectFrom('library_tracks')
      .where('path', 'in', tracks.map(track => track.path))
      .selectAll()
      .execute()

    await $db()
      .insertInto('library_tracks_source')
      .values(existingLibraryTracks.map(track => ({
        source_id: source.id,
        source_type: source.type,
        track_id: track.id,
      })))
      .onConflict(conflict => conflict.doNothing())
      .execute()

    refreshTrackListForType('library')

    return existingLibraryTracks
  }

  async function addLibraryTrackSource(opts: { sourceId: string, sourceType: 'folder' | 'playlist', trackId: number }) {
    const { sourceId, sourceType, trackId } = opts
    return $db()
      .insertInto('library_tracks_source')
      .values({
        source_id: sourceId,
        source_type: sourceType,
        track_id: trackId,
      })
      .onConflict(conflict => conflict.doNothing())
      .execute()
  }

  async function cleanupLibraryTrackSource(opts: TrackListEntry) {
    const libraryTrack = await $db()
      .selectFrom('library_tracks')
      .where('path', '=', opts.path)
      .selectAll()
      .executeTakeFirst()

    if (!libraryTrack) {
      return
    }

    if (opts.is_playlist_track) {
      await $db()
        .deleteFrom('library_tracks_source')
        .where('track_id', '=', libraryTrack.id)
        .where('source_type', '=', 'playlist')
        .where('source_id', '=', String(opts.playlist_id))
        .execute()
    }

    const remainingSources = await $db()
      .selectFrom('library_tracks_source')
      .where('track_id', '=', libraryTrack.id)
      .selectAll()
      .execute()

    if (remainingSources.length === 0) {
      await $db()
        .deleteFrom('library_tracks')
        .where('id', '=', libraryTrack.id)
        .execute()
    }

    refreshTrackListForType('library')
  }

  return {
    addFolderToLibrary,
    addLibraryTrackSource,
    addTracksToLibrary,
    cleanupLibraryTrackSource,
    getLibraryTracks,
    isAddingFolderToLibrary,
    isRemovingFolderFromLibrary,
    removeFolderFromLibrary,
    useFolderInLibrary,
  }
}

function buildFolderInLibraryKey(folderPath: string) {
  return `${folderPath}-in-library`
}
