<script lang="ts" setup>
const { createPlaylist } = useUserPlaylists()
</script>

<template>
  <div class="flex h-full flex-col gap-2 *:px-4 *:first:pt-4 *:last:pb-4">
    <LayoutLibraryActions />
    <!-- <div class="bg-border h-px mx-4 my-2 p-0" /> -->
    <UContextMenu>
      <UContextMenuTrigger as-child>
        <LayoutLibraryList />
      </UContextMenuTrigger>
      <UContextMenuContent>
        <UContextMenuItem
          @click="
            createPlaylist({
              name: 'New playlist',
            })
          "
        >
          <Icon name="tabler:playlist-add" class="size-4" />
          New playlist
        </UContextMenuItem>
        <UContextMenuItem>
          <Icon name="tabler:folder-plus" class="size-4" />
          New folder
        </UContextMenuItem>
      </UContextMenuContent>
    </UContextMenu>
  </div>
</template>
