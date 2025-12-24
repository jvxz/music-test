export type SortBy = keyof typeof ID3_MAP

export interface TrackListData {
  path: string
  sortBy: SortBy
  sortOrder: SortOrder
}

const defaultData: TrackListData = {
  path: '',
  sortBy: 'TIT2',
  sortOrder: 'Asc',
}

export const TRACK_LIST_VIRTUALIZATION_THRESHOLD = 500
export const TRACK_LIST_COLUMNS: {
  id3?: Id3FrameId
  key: string
  label: string
  default?: keyof FileEntry
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

export const useTrackListData = createSharedComposable(() => {
  const { $tauri } = useNuxtApp()

  const newData = $tauri.prefs.get('track-list-directory') as TrackListData | undefined

  const data = refWithControl(newData ?? defaultData, {
    onChanged: newData => $tauri.store.set('track-list-directory', newData),
  })

  return data
})

interface Params {
  type: 'folder' | 'playlist'
  /**
   * folder directory or playlist id
   */
  path: string
}

export function useTrackList(params: Params) {
  const { path, type } = params

  const nuxtApp = useNuxtApp()
  const { rpc } = useTauri()
  const trackListData = useTrackListData()

  trackListData.value.path = path

  const key = computed(() => `${path}-${trackListData.value.sortBy}-${trackListData.value.sortOrder}`)
  const { data: folderEntries, execute: refreshReadFolder, pending: isLoadingPlaylistData } = useAsyncData<FileEntry[]>(key, async () => {
    if (type === 'folder') {
      return rpc.read_folder(path, {
        key: trackListData.value.sortBy,
        order: trackListData.value.sortOrder,
      })
    }
    else {
      return await useUserPlaylists().getPlaylistTracks(Number(path))
    }
  }, {
    default: () => [],
    getCachedData: key => nuxtApp.payload.data?.[key] || nuxtApp.static?.data?.[key] || undefined,
    immediate: true,
  })

  function sortBy(opts: {
    key: SortBy
    order: SortOrder
  }) {
    trackListData.value = {
      path: trackListData.value.path,
      sortBy: opts.key,
      sortOrder: opts.order,
    }

    refreshReadFolder()
  }

  return {
    folderEntries,
    isLoadingPlaylistData,
    playlistData: trackListData,
    sortBy,
  }
}

export function refreshTrackListForPlaylist(playlistId: number) {
  const { payload } = useNuxtApp()

  const payloadData = payload.data as Record<string, unknown>
  const keysToClear = Object.keys(payloadData).filter(key => key.startsWith(`${playlistId}-`))

  clearNuxtData(keysToClear)
}
