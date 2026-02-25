<script lang="ts" setup>
defineProps<{
  playlists: Selectable<DB['playlists']>[]
}>()

const { createPlaylist, deletePlaylist, renamePlaylist } = useUserPlaylists()

function handleRenameSubmit(playlistId: number, name: string | null | undefined) {
  if (!name)
    return

  renamePlaylist(playlistId, name)
}

const open = shallowRef(false)
let shouldOpen = false

const debouncedOpen = useDebounceFn(() => {
  if (shouldOpen)
    open.value = true
}, 500)

function handleDragOver() {
  shouldOpen = true
  debouncedOpen()
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <UContextMenu>
      <UContextMenuTrigger as-child>
        <CollapsibleRoot v-model:open="open">
          <CollapsibleTrigger as-child>
            <TauriDragoverProvider
              class="group"
              :acceptable-keys="['track-list-entry', 'UNKNOWN']"
              @over="handleDragOver"
              @leave="() => shouldOpen = false"
            >
              <UButton
                variant="ghost"
                class="mb-px w-full justify-start text-foreground data-drag-over:bg-muted"
              >
                <Icon name="tabler:chevron-right" class="size-4 group-data-[state=open]:rotate-90" />
                Playlists
              </UButton>
            </TauriDragoverProvider>
          </CollapsibleTrigger>
          <CollapsibleContent class="ml-3.5 space-y-px overflow-hidden border-l pl-1.5">
            <LayoutPanelLibraryListPlaylistItem
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
