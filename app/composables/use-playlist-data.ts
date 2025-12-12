export function usePlaylistData() {
  const nuxtApp = useNuxtApp()
  const { rpc } = useTauri()
  const playlistData = shallowRef<{
    path: string
    sortBy: SortBy
    sortOrder: SortOrder
  }>({
    path: '/Users/jamie/Downloads',
    sortBy: 'TYER',
    sortOrder: 'asc',
  })

  type SortBy = keyof typeof ID3_MAP
  type SortOrder = 'asc' | 'desc'

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
    watch: [playlistData],
  })

  return {
    folderEntries,
    playlistData,
  }
}
