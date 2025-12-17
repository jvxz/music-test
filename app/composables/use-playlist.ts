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

export function usePlaylist() {
  const nuxtApp = useNuxtApp()
  const { rpc } = useTauri()
  const playlistData = usePlaylistData()

  const key = computed(() => `${playlistData.value.path}-${playlistData.value.sortBy}-${playlistData.value.sortOrder}`)
  const { data: folderEntries } = useAsyncData(key, async () => {
    const data = await rpc.read_folder(playlistData.value.path)

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
    watch: [computed(() => playlistData.value.path)],
  })

  return {
    folderEntries,
    playlistData,
  }
}
