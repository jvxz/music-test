export type SortBy = keyof typeof ID3_MAP

export interface TrackListInput {
  path: string
  sortBy: SortBy
  sortOrder: 'Asc' | 'Desc'
  type: 'folder' | 'playlist'
}

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

export const useTrackListInput = createSharedComposable(() => {
  const { $tauri } = useNuxtApp()

  const newData = $tauri.prefs.get('track-list-directory') as TrackListInput | undefined

  const data = refWithControl(newData ?? defaultData, {
    onChanged: newData => $tauri.store.set('track-list-directory', newData),
  })

  return data
})

const useTrackListCache = () => useState<Map<string, FileEntry[]>>('track-list-cache', () => new Map())

export function useTrackList() {
  const { rpc } = useTauri()
  const trackListInput = useTrackListInput()
  const trackListCache = useTrackListCache()

  function getTrackList(input: Ref<TrackListInput>) {
    const asyncData = useAsyncData<FileEntry[]>(computed(() => createTrackListInputKey(input.value)), async () => {
      const cachedData = trackListCache.value.get(createTrackListInputKey(input.value))
      if (cachedData) {
        return cachedData
      }

      const data = input.value.type === 'folder'
        ? await rpc.read_folder(input.value.path)
        : await useUserPlaylists().getPlaylistTracks(Number(input.value.path))

      const sortedData = sortTrackList(data, input.value.sortBy, input.value.sortOrder)
      trackListCache.value.set(createTrackListInputKey(input.value), sortedData)
      return sortedData
    }, {
      default: () => [],
      immediate: true,
      watch: [input],
    })

    return asyncData
  }

  return {
    getTrackList,
    playlistData: trackListInput,
  }
}

export function createTrackListInputKey(input: { type: 'folder' | 'playlist', path: string, sortBy: SortBy, sortOrder: 'Asc' | 'Desc' }) {
  return `${input.type}-${input.path}-${input.sortBy}-${input.sortOrder}`
}

export function refreshTrackListForPlaylist(trackListInput: TrackListInput) {
  clearNuxtData(createTrackListInputKey(trackListInput))
}
