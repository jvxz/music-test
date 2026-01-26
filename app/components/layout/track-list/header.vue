<script lang="ts" setup>
const props = defineProps<{
  path: TrackListInput['path']
  type: TrackListEntryType
  trackCount: number
  isLoading: boolean
}>()

const { deletePlaylist, getPlaylistName } = useUserPlaylists()
const query = useTrackListSearchQuery()
const { addFolderToLibrary, removeFolderFromLibrary, useFolderInLibrary } = useLibrary()

const { data: isFolderInLibrary, execute: checkFolderInLibrary } = useFolderInLibrary(props.path ?? '')
onMounted(() => {
  if (props.type === 'folder') {
    checkFolderInLibrary()
  }
})

const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
onKeyStrokeSafe('meta_f', () => {
  const el = unrefElement(searchInput)
  if (el) {
    el.focus()
    el.select()
  }
}, {
  ignore: ['[data-slot="command-input"]'],
})

const title = computed(() => {
  if (props.type === 'library')
    return 'Library'

  if (props.type === 'folder')
    return props.path

  return getPlaylistName(Number(props.path))
})
</script>

<template>
  <div class="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
    <div class="flex flex-col justify-center">
      <div class="flex items-center gap-2">
        <p :title class="w-md truncate text-md font-medium">
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
      <UInput
        id="track-list-search-input"
        ref="searchInput"
        v-model="query"
        v-esc-blur
        v-no-autocorrect
        placeholder="Search"
      />
      <UDropdownMenuRoot>
        <UDropdownMenuTrigger as-child>
          <UButton variant="soft" size="icon">
            <Icon name="tabler:dots-vertical" />
          </UButton>
        </UDropdownMenuTrigger>
        <UDropdownMenuContent align="end">
          <template v-if="type === 'folder'">
            <UDropdownMenuItem v-if="!isFolderInLibrary" @click="addFolderToLibrary(0, path)">
              Add to library
            </UDropdownMenuItem>
            <UDropdownMenuItem v-else @click="removeFolderFromLibrary(0, path)">
              Remove from library
            </UDropdownMenuItem>
          </template>
          <template v-else-if="type === 'playlist'">
            <UDropdownMenuItem @click="deletePlaylist(Number(path))">
              Delete playlist
            </UDropdownMenuItem>
          </template>
          <template v-else-if="type === 'library'">
            <UDropdownMenuItem>
              Add folder to library...
            </UDropdownMenuItem>
          </template>
        </UDropdownMenuContent>
      </UDropdownMenuRoot>
    </div>
  </div>
</template>
