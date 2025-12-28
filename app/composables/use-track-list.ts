export const TRACK_LIST_ITEM_HEIGHT = 34

const defaultData: TrackListInput = {
  path: '',
  sortBy: 'TIT2',
  sortOrder: 'Asc',
  type: 'folder',
}

export const TRACK_LIST_VIRTUALIZATION_THRESHOLD = 400
export const TRACK_LIST_COLUMNS: {
  id3?: Id3FrameId
  key: string
  label: string
  default?: keyof TrackListEntry
  canSort: boolean
}[] = [
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

export const useTrackListInput = createSharedComposable(() => {
  const { $tauri } = useNuxtApp()

  const newData = $tauri.prefs.get('track-list-directory') as TrackListInput | undefined

  const data = refWithControl(newData ?? defaultData, {
    onChanged: newData => $tauri.store.set('track-list-directory', newData),
  })

  return data
})

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
          //                                                 cast because the rpc always returns
          //                                               ↓ with the is_playlist_track flag set to false
          tracks = await rpc.read_folder(input.value.path) as FolderEntry[]
          break
        }

        case 'playlist': {
          tracks = await getPlaylistTracks(Number(input.value.path))
          break
        }

        case 'library': {
          tracks = await getLibraryTracks()
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
        return results.value
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
  return `${input.type}-${input.path}-${input.sortBy}-${input.sortOrder}`
}

export function refreshTrackListForType(trackListType: TrackListInput['type'], path?: string) {
  const trackListCache = useTrackListCache()

  if (trackListType === 'library') {
    trackListCache.value.forEach((_, key, map) => {
      if (key.startsWith(`library-`)) {
        map.delete(key)
      }
    })
  }

  else {
    trackListCache.value.forEach((_, key, map) => {
      if (key.startsWith(`playlist-${path}-`)) {
        map.delete(key)
      }

      if (key.startsWith(`playlist-`)) {
        map.delete(key)
      }
    })
  }
}
