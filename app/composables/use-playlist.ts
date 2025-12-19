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
  const { data: folderEntries } = useAsyncData(key, async () => {
    const data = await rpc.read_folder(path)

    const sorted = data.toSorted((a, b) => {
      const type = typeof a.tags[playlistData.value.sortBy]

      if (type === 'string') {
        return a.tags[playlistData.value.sortBy]!.localeCompare(b.tags[playlistData.value.sortBy]!) * (playlistData.value.sortOrder === 'asc' ? 1 : -1)
      }

      if (type === 'number') {
        return (Number(a.tags[playlistData.value.sortBy]!) - Number(b.tags[playlistData.value.sortBy]!)) * (playlistData.value.sortOrder === 'asc' ? 1 : -1)
      }

      return 0
    })

    return sorted
  }, {
    default: () => [],
    getCachedData: key => nuxtApp.payload.data?.[key] || nuxtApp.static?.data?.[key] || undefined,
    immediate: true,
    watch: [playlistData],
  })

  return {
    folderEntries,
    playlistData,
  }
}
