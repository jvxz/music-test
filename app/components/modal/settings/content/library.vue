<script lang="ts" setup>
import type { AcceptableValue } from 'reka-ui'

const { getLibraryFolders, removeFolderFromLibrary } = useLibrary()

const { data: folders } = getLibraryFolders()

const selectedFolder = shallowRef<AcceptableValue>(null)

function handleRemoveFolder(folderPath: AcceptableValue) {
  removeFolderFromLibrary(0, folderPath)
  if (selectedFolder.value === folderPath) {
    selectedFolder.value = null
  }
}
</script>

<template>
  <ModalSettingsContentLayout>
    <h2 class="shrink-0 text-lg font-medium">
      Monitored folders
    </h2>
    <div class="flex flex-col gap-1">
      <UCard class="gap-0 bg-background p-1 px-2 font-mono text-sm">
        <ToggleGroupRoot
          v-model:model-value="selectedFolder"
          type="single"
          class="h-32 space-y-0.5 overflow-y-auto"
        >
          <ToggleGroupItem
            v-for="folder in folders"
            :key="folder.path"
            :value="folder.path"
            as-child
          >
            <button class="w-full truncate text-left data-[state=on]:bg-muted">
              {{ folder.path }}
            </button>
          </ToggleGroupItem>
        </ToggleGroupRoot>
      </UCard>
      <div class="flex justify-between">
        <UButton variant="outline">
          Add folder...
        </UButton>
        <UButton
          variant="outline"
          :disabled="!selectedFolder"
          @click="handleRemoveFolder(selectedFolder)"
        >
          Remove
        </UButton>
      </div>
    </div>
  </ModalSettingsContentLayout>
</template>
