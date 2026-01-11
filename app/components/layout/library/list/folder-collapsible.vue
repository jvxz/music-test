<script lang="ts" setup>
defineProps<{
  folders: Selectable<DB['library_folders']>[]
}>()

const open = shallowRef(false)
</script>

<template>
  <div v-if="folders" class="flex flex-col gap-1">
    <UContextMenu>
      <UContextMenuTrigger as-child>
        <CollapsibleRoot v-model:open="open">
          <CollapsibleTrigger as-child>
            <UButton
              variant="ghost"
              class="group w-full justify-start text-foreground mb-px"
            >
              <Icon name="tabler:chevron-right" class="size-4 group-data-[state=open]:rotate-90" />
              Folders
            </UButton>
          </CollapsibleTrigger>
          <CollapsibleContent class="ml-3.5 space-y-px overflow-hidden border-l pl-1.5">
            <LayoutLibraryListFolderItem
              v-for="folder in folders"
              :key="folder.path"
              :folder="folder"
            />
          </CollapsibleContent>
        </CollapsibleRoot>
      </UContextMenuTrigger>
      <UContextMenuContent>
        <UContextMenuLabel>
          Folders
        </UContextMenuLabel>
        <UContextMenuItem @click="() => {}">
          Add folder...
        </UContextMenuItem>
      </UContextMenuContent>
    </UContextMenu>
  </div>
</template>
