<script lang="ts" setup>
defineProps<{
  entry: TrackListEntry | null
}>()

const { addToPlaylist, playlists, removeFromPlaylist } = useUserPlaylists()

async function handleRemove(entry: PlaylistEntry) {
  await removeFromPlaylist(entry.playlist_id, entry)
  useTrackListRefresh.trigger()
}
</script>

<template>
  <UContextMenu>
    <UContextMenuTrigger as-child>
      <slot />
    </UContextMenuTrigger>
    <UContextMenuContent v-if="entry" class="w-52">
      <!-- <UContextMenuLabel class="truncate" :title="entry.name">
        {{ entry.name }}
      </UContextMenuLabel> -->

      <UContextMenuSub>
        <UContextMenuSubTrigger>
          Add to playlist
        </UContextMenuSubTrigger>
        <UContextMenuSubContent>
          <UContextMenuItem
            v-for="playlist in playlists"
            :key="playlist.id"
            @click="addToPlaylist(playlist.id, [entry])"
          >
            {{ playlist.name }}
          </UContextMenuItem>
        </UContextMenuSubContent>
      </UContextMenuSub>
      <UContextMenuItem
        v-if="entry.is_playlist_track"
        class="focus-visible:bg-red-400/20"
        @click="handleRemove(entry)"
      >
        Remove from playlist
      </UContextMenuItem>
    </UContextMenuContent>
  </UContextMenu>
</template>
