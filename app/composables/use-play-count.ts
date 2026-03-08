import { LazyStore } from '@tauri-apps/plugin-store'

export const playCountLazyStore = new LazyStore('play-count-cache.json', {
  autoSave: 500,
  defaults: {},
})

export function usePlayCount() {
  const { lastFmProfile, lastFmProfilePending } = storeToRefs(useLastFm())
  const { refreshTrackData } = useTrackData()
  const { emitMessage } = useConsole()

  const updatePlayCount = useDebounceFn(async (track: TrackListEntry) => {
    await until(lastFmProfilePending).toBe(false)

    if (!lastFmProfile.value || !canProcessTrack(track))
      return null

    const key = await getTrackKey(track)
    if (!key)
      return null

    const playCountRes = await $invoke(commands.getPlayCount, track.tags.TIT2, track.tags.TPE1, lastFmProfile.value.name)
    const playCount = Number(playCountRes.track.playcount)

    const exists = await $db()
      .selectFrom('track_play_count')
      .where('id_hash', '=', key)
      .selectAll()
      .executeTakeFirst()

    if (exists) {
      await $db()
        .updateTable('track_play_count')
        .set({
          play_count: playCount,
        })
        .where('id_hash', '=', key)
        .execute()
    }
    else {
      await $db()
        .insertInto('track_play_count')
        .values({
          human_readable_id: track.tags.TPE1 + track.tags.TIT2,
          id_hash: key,
          last_updated_from: 'lastfm',
          play_count: playCount,
        })
        .execute()
    }

    await refreshTrackData(track.path)

    emitMessage({
      source: 'LastFm',
      text: `Updated play count for track "${getTrackTitle(track)}" to ${playCount}`,
      type: 'log',
    })

    return playCount
  }, 1000)

  function canProcessTrack(track: TrackListEntry): track is TrackListEntry & { tags: { TPE1: string, TIT2: string } } {
    return !!(lastFmProfile && track.valid && track.tags.TPE1 && track.tags.TIT2)
  }

  async function getTrackKey(track: TrackListEntry) {
    if (!track.tags.TPE1 || !track.tags.TIT2)
      return null

    const hasher = await getHasher()
    return hasher(new TextEncoder().encode(track.tags.TIT2 + track.tags.TPE1)).toString()
  }

  return {
    updatePlayCount,
  }
}
