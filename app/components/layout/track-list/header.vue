<script lang="ts" setup>
const props = defineProps<{
  path: string
  type: 'folder' | 'playlist'
  trackCount: number
  isLoading: boolean
}>()

const { getPlaylistName } = useUserPlaylists()
const { addFolderToLibrary } = useLibrary()

const title = computed(() => {
  if (props.type === 'folder')
    return props.path

  return getPlaylistName(Number(props.path))
})
</script>

<template>
  <div class="flex h-16 items-center justify-between border-b bg-background px-4">
    <div class="flex flex-col justify-center">
      <p class="text-lg font-medium">
        {{ title }}
      </p>
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
          <UDropdownMenuItem v-if="type === 'folder'" @click="addFolderToLibrary(0, path)">
            Add to library
          </UDropdownMenuItem>
        </UDropdownMenuContent>
      </UDropdownMenuRoot>
    </div>
  </div>
</template>
