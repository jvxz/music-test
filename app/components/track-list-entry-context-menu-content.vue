<script lang="ts" setup>
import { revealItemInDir } from '@tauri-apps/plugin-opener'

defineProps<{
  entry: TrackListEntry | null
}>()

const { addToPlaylist, playlists, removeFromPlaylist } = useUserPlaylists()

async function handleRemove(entry: TrackListEntry) {
  if (!entry.is_playlist_track) {
    return
  }

  await removeFromPlaylist(entry.playlist_id, entry)
  useTrackListRefresh.trigger()
}
</script>

<template>
  <UContextMenuContent v-if="entry" class="w-52">
    <!-- <UContextMenuLabel class="truncate" :title="entry.name">
        {{ entry.name }}
      </UContextMenuLabel> -->

    <UContextMenuSub>
      <UContextMenuSubTrigger :disabled="!entry.valid">
        Add to playlist
      </UContextMenuSubTrigger>
      <UContextMenuSubContent>
        <UContextMenuItem
          v-for="playlist in playlists"
          :key="playlist.id"
          :disabled="!entry.valid"
          @click="addToPlaylist(playlist.id, [entry])"
        >
          {{ playlist.name }}
        </UContextMenuItem>
      </UContextMenuSubContent>
    </UContextMenuSub>
    <UContextMenuItem
      v-if="entry.is_playlist_track"
      @click="handleRemove(entry)"
    >
      Remove from playlist
    </UContextMenuItem>
    <UContextMenuItem
      :disabled="!entry.valid"
      @click="revealItemInDir(entry.path)"
    >
      Reveal in file explorer
    </UContextMenuItem>
  </UContextMenuContent>
</template>
