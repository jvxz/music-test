export type SortBy = keyof typeof ID3_MAP

export interface TrackListInput {
  path: string
  sortBy: SortBy
  sortOrder: SortOrder
  type: 'folder' | 'playlist'
}

const defaultData: TrackListInput = {
  path: '',
  sortBy: 'TIT2',
  sortOrder: 'Asc',
  type: 'folder',
}

export const TRACK_LIST_VIRTUALIZATION_THRESHOLD = 750
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

export function useTrackList() {
  const nuxtApp = useNuxtApp()
  const { rpc } = useTauri()
  const trackListInput = useTrackListInput()

  function getTrackList(input: Ref<TrackListInput>) {
    const asyncData = useAsyncData<FileEntry[]>(computed(() => createTrackListInputKey(input.value)), async () => {
      if (input.value.type === 'folder') {
        return rpc.read_folder(input.value.path, {
          key: trackListInput.value.sortBy,
          order: trackListInput.value.sortOrder,
        })
      }
      else {
        return useUserPlaylists().getPlaylistTracks(Number(input.value.path))
      }
    }, {
      default: () => [],
      getCachedData: key => nuxtApp.payload.data?.[key] || nuxtApp.static?.data?.[key] || undefined,
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

export function createTrackListInputKey(input: { type: 'folder' | 'playlist', path: string }) {
  return `${input.type}-${input.path}`
}

export function refreshTrackListForPlaylist(playlistId: number) {
  clearNuxtData(createTrackListInputKey({ path: playlistId.toString(), type: 'playlist' }))
}
