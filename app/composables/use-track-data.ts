type CacheEntryKeysToOmit = 'name' | 'filename' | 'tags' | 'thumbnail_uri' | 'full_uri' | 'extension' | 'primary_tag' | 'valid'
export type TrackListCacheEntry = Prettify<Omit<PlaylistEntry, CacheEntryKeysToOmit> | Omit<FolderEntry, CacheEntryKeysToOmit>>

export const useTrackData = defineStore('track-data', () => {
  // path, file entry
  const trackCache = shallowReactive<Map<string, FileEntry>>(new Map())
  const trackListCache = shallowReactive<Map<string, TrackListCacheEntry[]>>(new Map())

  async function getTrackData(path: string) {
    const cachedTrack = trackCache.get(path)

    if (cachedTrack)
      return cachedTrack

    const track = await $invoke(commands.getTrackData, path, false)
    trackCache.set(path, track)

    return track
  }

  async function getFolderTracks(path: string) {
    const paths = await $invoke(commands.getFolderTrackPaths, path, false)
    return getTracksData(paths)
  }

  async function getTracksData(paths: string[]) {
    const tracks = await $invoke(commands.getTracksData, paths)

    tracks.forEach(track => trackCache.set(track.path, track))

    return tracks
  }

  async function refreshTrackData(path: string) {
    const track = await $invoke(commands.getTrackData, path, true)
    trackCache.set(path, track)

    return track
  }

  return {
    getFolderTracks,
    getTrackData,
    getTracksData,
    refreshTrackData,
    trackCache,
    trackListCache,
  }
})

export function refreshTrackListForType(type: TrackListInput['type'], path?: string) {
  const { trackListCache } = useTrackData()
  const keys = Array.from(trackListCache.keys())
    .filter(k => k.startsWith(`${type}-${path}-`))

  useTrackListRefresh.trigger({ keys })
}

export function createTrackListInputKey(input: TrackListInput) {
  if (input.type === 'library') {
    return `library-${input.sortBy}-${input.sortOrder}`
  }

  return `${input.type}-${input.path}-${input.sortBy}-${input.sortOrder}`
}
