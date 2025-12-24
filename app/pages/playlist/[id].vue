<script lang="ts" setup>
const route = useRoute()
const id: number = 'id' in route.params ? Number(route.params.id) : 0

const { getPlaylistTracks } = useUserPlaylists()
const { rpc } = useTauri()

const { data: playlistFileEntries } = useAsyncData(computed(() => `playlist-tracks-${id}`), async () => {
  const playlistTracks = await getPlaylistTracks(id)

  const fileEntries = await Promise.all(playlistTracks.map(async (track) => {
    const fileEntry = await rpc.get_track_data(track.path)
    return {
      ...track,
      file: fileEntry,
    }
  }))

  return fileEntries
}, {
  default: () => [],
  immediate: true,
})
</script>

<template>
  <div v-if="playlistFileEntries">
    <LayoutTrackList
      type="playlist"
      :path="id.toString()"
    />
  </div>
</template>
