<script lang="ts" setup>
defineProps<{
  folder: Selectable<DB['library_folders']>
}>()

const route = useRoute()

const urlFolderPath = computed(() => 'path' in route.params ? decodeURIComponent(route.params.path) : '')
</script>

<template>
  <UContextMenu>
    <UContextMenuTrigger as-child>
      <UButton
        variant="ghost"
        :class="cn('w-full justify-start text-foreground', urlFolderPath === folder.path && 'ghost-button-active')"
        @click="navigateTo({
          name: 'folder-path',
          params: {
            path: folder.path,
          },
        })"
      >
        <span :title="folder.path" class="truncate">
          {{ folder.path }}
        </span>
      </UButton>
    </UContextMenuTrigger>
    <UContextMenuContent class="w-52">
      <UContextMenuLabel class="truncate">
        {{ folder.path }}
      </UContextMenuLabel>
      <UContextMenuItem @click="() => {}">
        Remove from library
      </UContextMenuItem>
    </UContextMenuContent>
  </UContextMenu>
</template>
