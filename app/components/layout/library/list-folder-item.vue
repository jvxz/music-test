<script lang="ts" setup>
const props = defineProps<{
  playlist: Selectable<DB['playlists']>
}>()

const emits = defineEmits<{
  submitRename: [name: string | null | undefined]
  deletePlaylist: []
  addTracksToPlaylist: [itemPaths: string[]]
}>()

const { addToPlaylist } = useUserPlaylists()

async function handleDrop(itemPaths: string[]) {
  const tracks = await useTauri().rpc.get_tracks_data(itemPaths)
  addToPlaylist(props.playlist.id, tracks)
}
</script>

<template>
  <EditableRoot
    v-slot="{ submit, edit, isEditing }"
    :default-value="playlist.name"
    activation-mode="dblclick"
    @submit="(name) => emits('submitRename', name)"
  >
    <UContextMenu>
      <UContextMenuTrigger as-child :disabled="isEditing">
        <TauriDragoverProvider @drop="handleDrop">
          <UButton
            variant="ghost"
            class="group w-full justify-start text-foreground data-drag-over:bg-muted"
            :class="isEditing ? 'bg-transparent!' : ''"
            @click="navigateTo(`/playlist/${playlist.id}`)"
          >
            <EditableArea>
              <EditablePreview as-child>
                <span>{{ playlist.name }}</span>
              </EditablePreview>
              <EditableInput class="-mx-1 bg-card p-1 outline-none" @keydown.enter="submit" />
            </EditableArea>
          </UButton>
        </TauriDragoverProvider>
      </UContextMenuTrigger>
      <UContextMenuContent class="w-52">
        <UContextMenuLabel class="truncate">
          {{ playlist.name }}
        </UContextMenuLabel>
        <UContextMenuItem @click="edit">
          Rename
        </UContextMenuItem>
        <UContextMenuItem @click="emits('deletePlaylist')">
          Delete
        </UContextMenuItem>
      </UContextMenuContent>
    </UContextMenu>
  </EditableRoot>
</template>
