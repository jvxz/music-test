<script lang="ts" setup>
const props = defineProps<{
  path: string
  type: 'folder' | 'playlist'
  trackCount: number
  isLoading: boolean
}>()

const { getPlaylistName } = useUserPlaylists()
const { addFolderToLibrary, removeFolderFromLibrary, useFolderInLibrary } = useLibrary()

const { data: isFolderInLibrary, execute: checkFolderInLibrary } = useFolderInLibrary(props.path)
onMounted(() => {
  if (props.type === 'folder') {
    checkFolderInLibrary()
  }
})

const title = computed(() => {
  if (props.type === 'folder')
    return props.path

  return getPlaylistName(Number(props.path))
})
</script>

<template>
  <div class="flex h-16 items-center justify-between border-b bg-background px-4">
    <div class="flex flex-col justify-center">
      <div class="flex items-center gap-2">
        <p class="text-lg font-medium">
          {{ title }}
        </p>
        <Icon
          v-if="isFolderInLibrary"
          name="tabler:folder-check"
          class="size-4"
        />
      </div>
      <USpinner v-if="isLoading" class="h-[20px]" />
      <p v-else class="text-sm text-muted-foreground">
        {{ trackCount }} {{ checkPlural(trackCount, 'tracks', 'track') }}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <UDropdownMenuRoot>
        <UDropdownMenuTrigger as-child>
          <UButton variant="soft" size="icon">
            <Icon name="tabler:dots-vertical" />
          </UButton>
        </UDropdownMenuTrigger>
        <UDropdownMenuContent align="end">
          <UDropdownMenuItem v-if="type === 'folder' && !isFolderInLibrary" @click="addFolderToLibrary(0, path)">
            Add to library
          </UDropdownMenuItem>
          <UDropdownMenuItem v-else-if="type === 'folder' && isFolderInLibrary" @click="removeFolderFromLibrary(0, path)">
            Remove from library
          </UDropdownMenuItem>
        </UDropdownMenuContent>
      </UDropdownMenuRoot>
    </div>
  </div>
</template>
