export type SortBy = keyof typeof ID3_MAP

export interface PlaylistData {
  path: string
  sortBy: SortBy
  sortOrder: SortOrder
}

const defaultData: PlaylistData = {
  path: '',
  sortBy: 'TIT2',
  sortOrder: 'Asc',
}

export const VIRTUALIZATION_THRESHOLD = 500
export const PLAYLIST_COLUMNS: {
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

export const usePlaylistData = createSharedComposable(() => {
  const { $tauri } = useNuxtApp()

  const data = refWithControl($tauri.prefs.get('playlist-directory') as PlaylistData ?? defaultData, {
    onChanged: newData => $tauri.store.set('playlist-directory', newData),
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

export function usePlaylist(params: Params) {
  const { path, type } = params

  const nuxtApp = useNuxtApp()
  const { rpc } = useTauri()
  const playlistData = usePlaylistData()

  playlistData.value.path = path

  const key = computed(() => `${path}-${playlistData.value.sortBy}-${playlistData.value.sortOrder}`)
  const { data: folderEntries, execute: refreshReadFolder, pending: isLoadingPlaylistData } = useAsyncData<FileEntry[]>(key, async () => {
    if (type === 'folder') {
      return rpc.read_folder(path, {
        key: playlistData.value.sortBy,
        order: playlistData.value.sortOrder,
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
    playlistData.value = {
      path: playlistData.value.path,
      sortBy: opts.key,
      sortOrder: opts.order,
    }

    refreshReadFolder()
  }

  return {
    folderEntries,
    isLoadingPlaylistData,
    playlistData,
    sortBy,
  }
}
