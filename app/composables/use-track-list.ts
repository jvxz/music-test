export const TRACK_LIST_ITEM_HEIGHT = 34

const defaultData: TrackListInput = {
  path: '',
  sortBy: 'TIT2',
  sortOrder: 'Asc',
  type: 'folder',
}

export const TRACK_LIST_VIRTUALIZATION_THRESHOLD = 400

export const TRACK_LIST_COLUMNS: TrackListColumn[] = [
  {
    canSort: false,
    id3: 'APIC',
    key: 'cover',
    label: '',
  },
  {
    canSort: false,
    key: 'playing',
    label: '',
  },
  {
    canSort: true,
    default: 'name',
    id3: 'TIT2',
    key: 'title',
    label: 'Title',
  },
  {
    canSort: true,
    id3: 'TPE1',
    key: 'artist',
    label: 'Artist',
  },
  {
    canSort: true,
    id3: 'TALB',
    key: 'album',
    label: 'Album',
  },
  {
    canSort: true,
    id3: 'TYER',
    key: 'year',
    label: 'Year',
  },
  {
    canSort: true,
    id3: 'TCON',
    key: 'genre',
    label: 'Genre',
  },
  {
    canSort: true,
    id3: 'TRCK',
    key: 'track',
    label: 'Track',
  },
] as const

// export const useTrackListInput = createSharedComposable(() => {
//   const tauri = useTauri()

//   const newData = tauri.prefs.get('track-list-directory') as TrackListInput | undefined

//   const data = refWithControl(newData ?? defaultData, {
//     onChanged: (newData) => {
//       console.log('newData: ', newData)
//       tauri.store.set('track-list-directory', newData)
//     },
//   })

//   return data
// })
export function useTrackListInput() {
  const tauri = useTauri()

  const newData = tauri.prefs.get('track-list-directory') as TrackListInput | undefined

  const state = useState<TrackListInput>('track-list-input', () => newData ?? defaultData)

  watch(state, newData => tauri.store.set('track-list-directory', newData))

  return state
}

const useTrackListCache = () => useState<Map<string, TrackListEntry[]>>('track-list-cache', () => new Map())

export const useTrackListRefresh = createEventHook()

export function useTrackList() {
  const { rpc } = useTauri()
  const trackListInput = useTrackListInput()
  const trackListCache = useTrackListCache()
  const { getPlaylistTracks } = useUserPlaylists()
  const { getLibraryTracks } = useLibrary()

  function getTrackList(input: Ref<TrackListInput>) {
    const asyncData = useAsyncData<TrackListEntry[]>(computed(() => createTrackListInputKey(input.value)), async () => {
      const cachedData = trackListCache.value.get(createTrackListInputKey(input.value))
      if (cachedData) {
        return cachedData
      }

      let tracks: TrackListEntry[] = []

      switch (input.value.type) {
        case 'folder': {
          tracks = (await rpc.read_folder(input.value.path)).map(entry => ({
            ...entry,
            is_playlist_track: false as const,
          }))
          break
        }

        case 'playlist': {
          tracks = await getPlaylistTracks(Number(input.value.path))
          break
        }

        case 'library': {
          tracks = (await getLibraryTracks()).map(entry => ({
            ...entry,
            is_playlist_track: false as const,
          }))
          break
        }
      }

      const sortedData = sortTrackList(tracks, input.value.sortBy, input.value.sortOrder)
      trackListCache.value.set(createTrackListInputKey(input.value), sortedData)
      return sortedData
    }, {
      default: () => [],
      immediate: true,
      watch: [input],
    })

    useTrackListRefresh.on(() => asyncData.refresh())

    const { query, results } = useTrackListSearch(asyncData.data)
    const data = computed(() => {
      if (query.value) {
        return sortTrackList(results.value, input.value.sortBy, input.value.sortOrder)
      }
      return asyncData.data.value
    })

    return {
      ...asyncData,
      data,
    }
  }

  return {
    getTrackList,
    playlistData: trackListInput,
  }
}

export function createTrackListInputKey(input: TrackListInput) {
  if (input.type === 'library') {
    return `library-${input.sortBy}-${input.sortOrder}`
  }

  return `${input.type}-${input.path}-${input.sortBy}-${input.sortOrder}`
}

export function refreshTrackListForType(trackListType: TrackListInput['type'], path?: string) {
  const trackListCache = useTrackListCache()

  if (trackListType === 'library') {
    trackListCache.value.forEach((_, key, map) => {
      if (key.startsWith(`library-`)) {
        map.delete(key)
        refreshNuxtData(key)
      }
    })
  }

  else {
    trackListCache.value.forEach((_, key, map) => {
      if (key.startsWith(`playlist-${path}-`)) {
        map.delete(key)
        refreshNuxtData(key)
      }
    })
  }
}

export function markTrackAsInvalid(trackPath: string) {
  const trackListCache = useTrackListCache()

  trackListCache.value.forEach((tracks, key) => {
    const trackIndex = tracks.findIndex(t => t.path === trackPath)
    if (trackIndex !== -1 && tracks[trackIndex]) {
      tracks[trackIndex] = {
        ...tracks[trackIndex],
        valid: false,
      }
      refreshNuxtData(key)
    }
  })
}

export function markTrackAsValid(track: TrackListEntry) {
  const trackListCache = useTrackListCache()

  trackListCache.value.forEach(async (tracks, key) => {
    const trackIndex = tracks.findIndex(t => t.path === track.path)
    if (trackIndex !== -1 && tracks[trackIndex]) {
      const data = await getTracksData([track.path])
      if (data[0]) {
        tracks[trackIndex] = {
          ...data[0],
          is_playlist_track: track.is_playlist_track,
          ...(track.is_playlist_track && {
            added_at: track.added_at,
            id: track.track_id,
            playlist_id: track.playlist_id,
          }),
          valid: true,
        } as TrackListEntry
      }
      refreshNuxtData(key)
    }
  })
}
