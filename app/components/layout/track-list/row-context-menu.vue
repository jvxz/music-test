<script lang="ts" setup>
defineProps<{
  entry: FileEntry | null
}>()

const { addToPlaylist, playlists } = useUserPlaylists()
</script>

<template>
  <UContextMenu>
    <UContextMenuTrigger as-child>
      <slot />
    </UContextMenuTrigger>
    <UContextMenuContent v-if="entry" class="w-52">
      <UContextMenuLabel class="truncate" :title="entry.name">
        {{ entry.name }}
      </UContextMenuLabel>
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
    </UContextMenuContent>
  </UContextMenu>
</template>
