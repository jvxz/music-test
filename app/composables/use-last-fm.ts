import { LazyStore } from '@tauri-apps/plugin-store'

const offlineScrobbleCache = new LazyStore('lastfm-offline-scrobbles.json', {
  autoSave: true,
  defaults: {
    scrobbles: [],
  },
})

export const useLastFm = defineStore('lastfm', () => {
  const { isOnline } = useNetwork()
  const settings = useSettings()

  const { execute: refreshAuthStatus, isLoading: authStatusPending, state: authStatus } = useAsyncState(async () => {
    const status = await $invoke(commands.getLastfmAuthStatus)

    if (status)
      return settings.lastFm.username ?? undefined
  }, undefined, { immediate: false })

  const { execute: fetchLastFmProfile, isLoading: lastFmProfilePending, state: lastFmProfile } = useAsyncState(async () => {
    const username = toValue(authStatus.value)
    if (!username)
      return

    const res = await $lastfm('user.getInfo', {
      query: {
        user: username,
      },
    })

    if (!res.success)
      return

    return res.data.user
  }, undefined, { immediate: false })

  watch([isOnline, authStatus], async (isOnline) => {
    await until(authStatusPending).toBe(false)

    await fetchLastFmProfile()

    const shouldProcessOfflineScrobbles = settings.lastFm.doScrobbling && authStatus.value
    if (!shouldProcessOfflineScrobbles)
      return

    if (isOnline) {
      const scrobbles = await offlineScrobbleCache.get('scrobbles') as SerializedOfflineScrobble[] | undefined
      if (scrobbles && scrobbles.length > 0) {
        try {
          await $invoke(commands.processOfflineScrobbles, scrobbles)
        }
        catch {
          emitError({ data: `Failed to process offline scrobbles. Your ${scrobbles.length} ${checkPlural(scrobbles.length, 'cached scrobbles')} can be manually processed in settings`, type: 'LastFm' })
          return
        }
        await offlineScrobbleCache.clear()
      }
    }
  }, {
    immediate: true,
  })

  const startAuth = () => $invoke(commands.openLastfmAuth)
  const completeAuth = async (token: string) => {
    const username = await $invoke(commands.completeLastfmAuth, token)
    if (username) {
      settings.lastFm.username = username
      await refreshAuthStatus()
      return username
    }
  }
  const removeAuth = async () => {
    await $invoke(commands.removeLastfmAccount)
    settings.lastFm.username = null
    await refreshAuthStatus()
  }

  const updateNowPlaying = useDebounceFn(async (track: TrackListEntry, duration: number) => {
    if (!settings.lastFm.doScrobbling || !isOnline.value || !track.valid)
      return

    const scrobble = getSerializedScrobble(track, duration)
    if (scrobble)
      await $invoke(commands.setNowPlaying, scrobble)
  }, 2000)

  const scrobbleTrack = useDebounceFn(async (track: TrackListEntry, duration: number) => {
    if (!settings.lastFm.doScrobbling || !track.valid)
      return

    const scrobble = getSerializedScrobble(track, duration)
    if (scrobble) {
      if (!isOnline.value) {
        return await addOfflineScrobble({
          scrobble,
          timestamp: Math.floor(Date.now() / 1000),
        })
      }

      try {
        await $invoke(commands.scrobbleTrack, scrobble)
      }
      catch {
        return await addOfflineScrobble({
          scrobble,
          timestamp: Math.floor(Date.now() / 1000),
        })
      }
    }
  }, 2000)

  function getSerializedScrobble(track: TrackListEntry, duration: number) {
    if (!track.valid || !track.tags.TPE1 || !track.tags.TIT2)
      return null

    return {
      album: track.tags.TALB ?? null,
      album_artist: track.tags.TPE2 ?? null,
      artist: track.tags.TPE1,
      duration: Number(duration.toFixed(0)),
      track: track.tags.TIT2,
      track_number: track.tags.TRCK ? Number(track.tags.TRCK) : null,
    }
  }

  async function addOfflineScrobble(scrobble: SerializedOfflineScrobble) {
    const shouldCacheOfflineScrobbles = settings.lastFm.doOfflineScrobbling && authStatus.value
    if (!shouldCacheOfflineScrobbles)
      return

    const offlineScrobbles = (await offlineScrobbleCache.get('scrobbles')) as SerializedOfflineScrobble[] | undefined

    offlineScrobbleCache.set('scrobbles', [...offlineScrobbles ?? [], scrobble])
  }

  return {
    authStatus,
    authStatusPending,
    completeAuth,
    fetchLastFmProfile,
    lastFmProfile,
    lastFmProfilePending,
    refreshAuthStatus,
    removeAuth,
    scrobbleTrack,
    startAuth,
    updateNowPlaying,
  }
}, {
  tauri: {
    saveOnChange: true,
    syncInterval: 300,
    syncStrategy: 'debounce',
  },
})

const IMAGE_SIZES = {
  1: 'small',
  2: 'medium',
  3: 'large',
  4: 'extralarge',
}

export function getLastFmImage(
  images: { '#text': string, 'size': string }[],
  maxSize: keyof typeof IMAGE_SIZES = 4,
): string | null {
  const result: { '#text': string, 'size': string }[] = []
  for (let size = maxSize; size >= 1; size--) {
    const label = IMAGE_SIZES[size]
    const found = images.find(img => img.size === label && img['#text'])
    if (found)
      result.push(found)
  }
  return result[0]?.['#text'] ?? null
}
