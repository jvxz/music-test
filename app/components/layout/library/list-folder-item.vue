<script lang="ts" setup>
defineProps<{
  playlist: Selectable<DB['playlists']>
}>()

const emits = defineEmits<{
  submitRename: [name: string | null | undefined]
  deletePlaylist: []
}>()
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
        <UButton
          variant="ghost"
          class="group w-full justify-start text-foreground"
          :class="isEditing ? 'bg-transparent!' : ''"
        >
          <EditableArea>
            <EditablePreview as-child>
              <span>{{ playlist.name }}</span>
            </EditablePreview>
            <EditableInput class="-mx-1 bg-card p-1 outline-none" @keydown.enter="submit" />
          </EditableArea>
        </UButton>
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
