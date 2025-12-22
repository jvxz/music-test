<script lang="ts" setup>
const { createPlaylist, deletePlaylist, playlists, renamePlaylist } = useUserPlaylists()

function handleRenameSubmit(playlistId: number, name: string | null | undefined) {
  if (!name) {
    return
  }

  renamePlaylist(playlistId, name)
}
</script>

<template>
  <div v-if="playlists" class="flex size-full flex-col gap-1">
    <UContextMenu>
      <UContextMenuTrigger as-child>
        <CollapsibleRoot>
          <CollapsibleTrigger as-child>
            <UButton
              variant="ghost"
              class="group w-full justify-start text-foreground"
            >
              <Icon name="tabler:chevron-right" class="size-4 group-data-[state=open]:rotate-90" />
              Playlists
            </UButton>
          </CollapsibleTrigger>
          <CollapsibleContent class="ml-3.5 space-y-px overflow-hidden border-l pl-1.5">
            <LayoutLibraryListFolderItem
              v-for="playlist in playlists"
              :key="playlist.id"
              :playlist="playlist"
              @submit-rename="handleRenameSubmit(playlist.id, $event)"
              @delete-playlist="deletePlaylist(playlist.id)"
            />
          </CollapsibleContent>
        </CollapsibleRoot>
      </UContextMenuTrigger>
      <UContextMenuContent>
        <UContextMenuLabel>
          Playlists
        </UContextMenuLabel>
        <UContextMenuItem @click="createPlaylist({ name: 'New playlist' })">
          New playlist
        </UContextMenuItem>
      </UContextMenuContent>
    </UContextMenu>
  </div>
</template>
