export function useLastFm() {
  const { rpc } = useTauri()
  const { getSettingValue, setSettingValue } = useSettings()

  const { data: authStatus, execute: refreshAuthStatus, pending: authStatusPending } = useAsyncData('lastfm-auth', async () => {
    const status = await rpc.get_lastfm_auth_status()

    if (status) {
      return getSettingValue('last-fm.username') ?? undefined
    }
  })

  const useLastFmProfile = (usernameRef: MaybeRefOrGetter<string | undefined>) => useAsyncData(
    computed(() => `lastfm-profile${toValue(usernameRef) ? `-${toValue(usernameRef)}` : ''}`),
    async () => {
      const username = toValue(usernameRef)
      if (!username)
        return null

      const res = await $lastfm('user.getInfo', {
        query: {
          user: username,
        },
      })

      if (!res.success) {
        return null
      }

      return res.data.user
    },
  )

  const startAuth = () => rpc.open_lastfm_auth()
  const completeAuth = async (token: string) => {
    const username = await rpc.complete_lastfm_auth(token)
    if (username) {
      setSettingValue('last-fm.username', username)
      await refreshAuthStatus()
      return username
    }
  }
  const removeAuth = async () => {
    await rpc.remove_lastfm_account()
    setSettingValue('last-fm.username', null)
    await refreshAuthStatus()
  }

  const updateNowPlaying = useDebounceFn(async (track: TrackListEntry, duration: number) => {
    if (!getSettingValue('last-fm.do-scrobbling'))
      return

    const scrobble = getSerializedScrobble(track, duration)
    if (scrobble) {
      await rpc.set_now_playing(scrobble)
    }
  }, 2000)

  const scrobbleTrack = useDebounceFn(async (track: TrackListEntry, duration: number) => {
    if (!getSettingValue('last-fm.do-scrobbling'))
      return

    const scrobble = getSerializedScrobble(track, duration)
    if (scrobble) {
      await rpc.scrobble_track(scrobble)
    }
  }, 2000)

  function getSerializedScrobble(track: TrackListEntry, duration: number) {
    if (!track.tags.TPE1 || !track.tags.TIT2) {
      return null
    }

    return {
      album: track.tags.TALB ?? null,
      album_artist: track.tags.TPE2 ?? null,
      artist: track.tags.TPE1,
      duration: Number(duration.toFixed(0)),
      track: track.tags.TIT2,
      track_number: track.tags.TRCK ? Number(track.tags.TRCK) : null,
    }
  }

  return {
    authStatus,
    authStatusPending,
    completeAuth,
    removeAuth,
    scrobbleTrack,
    startAuth,
    updateNowPlaying,
    useLastFmProfile,
  }
}

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
    if (found) {
      result.push(found)
    }
  }
  return result[0]?.['#text'] ?? null
}
