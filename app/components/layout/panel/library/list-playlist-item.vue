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
const { getTracksData } = useTrackData()

async function handleDrop(itemPaths: string[]) {
  const tracks = await getTracksData(itemPaths)
  const validTracks = tracks.filter(track => track.valid)

  if (validTracks.length > 0) {
    await addToPlaylist(props.playlist.id, validTracks)
  }
}

const route = useRoute()
const urlPlaylistId = computed(() => 'id' in route.params ? Number(route.params.id) : null)
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
        <TauriDragoverProvider
          :acceptable-keys="['track-list-entry', 'UNKNOWN']"
          @drop="handleDrop"
        >
          <UButton
            variant="ghost"
            class="group w-full justify-start text-foreground data-drag-over:bg-muted"
            :class="cn(isEditing ? 'bg-transparent!' : '', urlPlaylistId === playlist.id && 'ghost-button-active')"
            @click="navigateTo({
              name: 'playlist-id',
              params: {
                id: playlist.id,
              },
            })"
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
