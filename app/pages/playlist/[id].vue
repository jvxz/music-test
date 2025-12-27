<script lang="ts" setup>
definePageMeta({
  middleware: async (to) => {
    const id = 'id' in to.params ? Number(to.params.id) : 0
    const playlistExists = await useUserPlaylists().checkPlaylistExists(id)

    if (id === 0 || !playlistExists)
      return abortNavigation()
  },
})

const route = useRoute()
const id = 'id' in route.params ? Number(route.params.id) : 0

const trackListInput = useTrackListInput()
</script>

<template>
  <div v-if="id" class="flex-1">
    <LayoutTrackList
      v-bind="trackListInput"
      type="playlist"
      :path="id.toString()"
    />
  </div>
</template>
