export function useLastFm() {
  const { rpc } = useTauri()
  const { getSettingValue, setSettingValue } = useSettings()

  const { data: authStatus, execute: refreshAuthStatus, pending: authStatusPending } = useAsyncData('lastfm-auth', async () => {
    const status = await rpc.get_lastfm_auth_status()

    if (status) {
      return getSettingValue('last-fm.username') ?? undefined
    }
  })

  const startAuth = () => rpc.open_lastfm_auth()
  const completeAuth = async (token: string) => {
    const username = await rpc.complete_lastfm_auth(token)
    if (username) {
      setSettingValue('last-fm.username', username)
      await refreshAuthStatus()
      return username
    }
  }
  const removeAuth = () => rpc.remove_lastfm_account()

  const updateNowPlaying = useDebounceFn(async (track: TrackListEntry, duration: number) => {
    const scrobble = getSerializedScrobble(track, duration)
    if (scrobble) {
      rpc.set_now_playing(scrobble)
    }
  }, 2000)

  const scrobbleTrack = useDebounceFn(async (track: TrackListEntry, duration: number) => {
    const scrobble = getSerializedScrobble(track, duration)
    if (scrobble) {
      rpc.scrobble_track(scrobble)
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
  }
}
