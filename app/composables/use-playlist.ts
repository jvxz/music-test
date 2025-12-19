type SortBy = keyof typeof ID3_MAP
type SortOrder = 'asc' | 'desc'

interface PlaylistData {
  path: string
  sortBy: SortBy
  sortOrder: SortOrder
}

const defaultData: PlaylistData = {
  path: '',
  sortBy: 'TIT2',
  sortOrder: 'asc',
}

export const usePlaylistData = createSharedComposable(() => {
  const { $tauri } = useNuxtApp()

  const data = refWithControl($tauri.prefs.get('playlist-directory') as PlaylistData ?? defaultData, {
    onChanged: newData => $tauri.store.set('playlist-directory', newData),
  })

  return data
})

interface Params {
  type: 'folder' | 'playlist'
  path: string
}

export function usePlaylist(params: Params) {
  const { path } = params

  const nuxtApp = useNuxtApp()
  const { rpc } = useTauri()
  const playlistData = usePlaylistData()

  playlistData.value.path = path

  const key = computed(() => `${path}-${playlistData.value.sortBy}-${playlistData.value.sortOrder}`)
  const { data: folderEntries, execute: refreshReadFolder } = useAsyncData(key, async () => rpc.read_folder(path, {
    key: playlistData.value.sortBy,
    order: playlistData.value.sortOrder === 'asc' ? 'Asc' : 'Desc',
  }), {
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
    playlistData,
    sortBy,
  }
}
