<script lang="ts" setup>
const props = defineProps<{
  type: 'folder' | 'playlist'
  path: string
}>()

const { folderEntries, playlistData, sortBy } = usePlaylist({
  path: props.path,
  type: props.type,
})
const { selectedTrack } = useTrackSelection()
const { playbackStatus, playTrack } = usePlayback()
const { layoutPanels: playlistHeaderPercents } = usePersistentPanels('playlist-columns', [5, 5, 25, 20, 20, 10, 15])

const cols: {
  id3?: Id3FrameId
  key: string
  label: string
  default?: keyof FileEntry
  canSort: boolean
}[] = [
  {
    canSort: false,
    id3: 'APIC',
    key: 'cover',
    label: '',
  },
  {
    canSort: false,
    key: 'playing',
    label: '',
  },
  {
    canSort: true,
    default: 'name',
    id3: 'TIT2',
    key: 'title',
    label: 'Title',
  },
  {
    canSort: true,
    id3: 'TPE1',
    key: 'artist',
    label: 'Artist',
  },
  {
    canSort: true,
    id3: 'TALB',
    key: 'album',
    label: 'Album',
  },
  {
    canSort: true,
    id3: 'TYER',
    key: 'year',
    label: 'Year',
  },
  {
    canSort: true,
    id3: 'TCON',
    key: 'genre',
    label: 'Genre',
  },
  {
    canSort: true,
    id3: 'TRCK',
    key: 'track',
    label: 'Track',
  },
] as const

const columnMinSizeMap: Record<typeof cols[number]['key'], number> = {
  cover: 3,
  playing: 1.5,
}

const { containerProps, list, scrollTo, wrapperProps } = useVirtualList(folderEntries, {
  itemHeight: 34,
  overscan: 8,
})

watch(() => playlistData.value.path, () => scrollTo(0))

onClickOutside(containerProps.ref, () => selectedTrack.value = null)

function handleTrackSelection(track: FileEntry) {
  if (selectedTrack.value?.path !== track.path) {
    selectedTrack.value = track
  }
}

function handleColumnClick(col: typeof cols[number]) {
  if (!col.canSort || !col.id3)
    return

  const sortOrder = col.id3 === playlistData.value.sortBy ? playlistData.value.sortOrder === 'asc' ? 'desc' : 'asc' : 'asc'

  sortBy({
    key: col.id3,
    order: sortOrder,
  })
}
</script>

<template>
  <div class="h-full flex-1 cursor-default select-none" v-bind="containerProps">
    <SplitterGroup
      direction="horizontal"
      class="sticky top-0 z-20 h-8! bg-background"
      @layout="playlistHeaderPercents = $event"
    >
      <template
        v-for="(col, index) in cols"
        :key="col.key"
      >
        <SplitterResizeHandle v-if="index !== 0" class="h-8 w-px bg-muted" />
        <SplitterPanel
          :default-size="playlistHeaderPercents[index]"
          :min-size="columnMinSizeMap[col.key] ?? 4"
          class="flex h-8 items-center"
          @pointerdown="handleColumnClick(col)"
        >
          <p class="truncate px-2 text-sm">
            {{ col.label }}
          </p>
          <Icon
            v-if="col.canSort"
            :name="playlistData.sortBy === col.id3 ? (playlistData.sortOrder === 'asc' ? 'tabler:sort-descending' : 'tabler:sort-ascending') : ''"
            class="size-3!"
          />
        </SplitterPanel>
      </template>
    </SplitterGroup>
    <div
      class="h-full"
      v-bind="wrapperProps"
    >
      <div
        v-for="entry in list"
        :key="entry.index"
        class="flex size-full h-8 items-center"
        :class="{
          'bg-primary/25': selectedTrack?.path === entry.data.path,
          'bg-muted/50': selectedTrack?.path !== entry.data.path && entry.index % 2 === 0,
        }"
        :style="{ contain: 'strict' }"
        @mousedown.left="handleTrackSelection(entry.data)"
        @dblclick.left="playTrack(entry.data.path)"
      >
        <template
          v-for="(col, i) in cols"
          :key="col.key"
        >
          <template v-if="col.key === 'cover'">
            <div v-if="!entry.data.tags.APIC" class="mx-auto grid place-items-center">
              -
            </div>

            <img
              v-else
              :src="entry.data.thumbnail_uri"
              :alt="entry.data.name"
              width="32"
              height="32"
              class="mx-auto h-full"
            />
          </template>
          <div
            v-else-if="col.key === 'playing'"
            class="flex shrink-0 grow-0 items-center justify-center"
            :style="{ flexBasis: `calc( (100% - ${(cols.length - 6)}px) * ${playlistHeaderPercents[i]} / 100 )` }"
          >
            <Icon
              v-if="playbackStatus?.path === entry.data.path"
              name="tabler:player-play"
              class="size-3!"
            />
          </div>
          <p
            v-else
            class="shrink-0 grow-0 truncate px-2 text-sm"
            :style="{ flexBasis: `calc( (100% - ${(cols.length - 6)}px) * ${playlistHeaderPercents[i]} / 100 )` }"
          >
            {{ col.id3 === 'TIT2' ? entry.data.tags[col.id3] ?? entry.data.name : entry.data.tags[col.id3 ?? ''] }}
          </p>
        </template>
      </div>
    </div>
  </div>
</template>
