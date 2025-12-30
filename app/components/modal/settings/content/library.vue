<script lang="ts" setup>
import type { AcceptableValue } from 'reka-ui'
import { open as openFilePicker } from '@tauri-apps/plugin-dialog'

const { copy } = useClipboard()
const { addFolderToLibrary, getLibraryFolders, removeFolderFromLibrary } = useLibrary()

const { data: folders } = getLibraryFolders()

const selectedFolder = shallowRef<AcceptableValue>(null)

function handleRemoveFolder(folderPath: AcceptableValue) {
  removeFolderFromLibrary(0, folderPath)
  if (selectedFolder.value === folderPath) {
    selectedFolder.value = null
  }
}

async function handleAddFolder() {
  const folderPath = await openFilePicker({
    directory: true,
  })
  if (folderPath) {
    addFolderToLibrary(0, folderPath)
  }
}

async function handleDrop(folderPaths: string[]) {
  await addFolderToLibrary(0, folderPaths[0])
}
</script>

<template>
  <ModalSettingsContentLayout>
    <h2 class="shrink-0 text-lg font-medium">
      Monitored folders
    </h2>
    <div class="flex flex-col gap-1">
      <TauriDragoverProvider v-slot="{ isOver }" @drop="handleDrop">
        <UCard class="relative gap-0 bg-background p-1 px-2 font-mono text-sm">
          <div v-show="isOver" class="pointer-events-none absolute inset-0 bg-background/50 grid place-items-center" >
            Drop to add folder
          </div>
          <ToggleGroupRoot
            v-model:model-value="selectedFolder"
            type="single"
            class="h-32 space-y-0.5 overflow-y-auto"
          >
            <UContextMenu
              v-for="folder in folders"
              :key="folder.path"
            >
              <UContextMenuTrigger as-child>
                <ToggleGroupItem
                  :value="folder.path"
                  as-child
                >
                  <button :title="folder.path" class="w-full truncate text-left select-none data-active:bg-muted">
                    {{ folder.path }}
                  </button>
                </ToggleGroupItem>
              </UContextMenuTrigger>
              <UContextMenuContent>
                <UContextMenuItem @click="copy(folder.path)">
                  Copy path
                </UContextMenuItem>
                <UContextMenuItem @click="handleRemoveFolder(folder.path)">
                  Remove
                </UContextMenuItem>
              </UContextMenuContent>
            </UContextMenu>
          </ToggleGroupRoot>
        </UCard>
      </TauriDragoverProvider>
      <div class="flex justify-between">
        <UButton variant="outline" @click="handleAddFolder">
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
