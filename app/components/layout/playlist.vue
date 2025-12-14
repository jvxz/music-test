<script lang="ts" setup>
const { folderEntries, playlistData } = usePlaylistData()
const { selectedTrack } = useTrackSelection()
const { playTrack } = usePlayback()
const { layoutPanels: playlistHeaderPercents } = usePersistentPanels('playlist-columns', [10, 25, 20, 20, 10, 15])

const cols: {
  id3: Id3FrameId
  key: string
  label: string
  width: number
  default?: keyof FileEntry
}[] = [
  {
    id3: 'APIC',
    key: 'cover',
    label: '',
    width: 48,
  },
  {
    default: 'name',
    id3: 'TIT2',
    key: 'title',
    label: 'Title',
    width: 100,
  },
  {
    id3: 'TPE1',
    key: 'artist',
    label: 'Artist',
    width: 100,
  },
  {
    id3: 'TALB',
    key: 'album',
    label: 'Album',
    width: 100,
  },
  {
    id3: 'TYER',
    key: 'year',
    label: 'Year',
    width: 100,
  },
  {
    id3: 'TCON',
    key: 'genre',
    label: 'Genre',
    width: 100,
  },
  {
    id3: 'TRCK',
    key: 'track',
    label: 'Track',
    width: 100,
  },
] as const

const { containerProps, list, wrapperProps } = useVirtualList(folderEntries, {
  itemHeight: 34,
  overscan: 8,
})

function handleTrackSelection(track: FileEntry) {
  if (selectedTrack.value?.path !== track.path) {
    selectedTrack.value = track
  }
}

function handleColumnClick(id3: Id3FrameId) {
  if (id3 === 'APIC')
    return

  const sortOrder = id3 === playlistData.value.sortBy ? playlistData.value.sortOrder === 'asc' ? 'desc' : 'asc' : 'asc'

  playlistData.value = {
    path: playlistData.value.path,
    sortBy: id3,
    sortOrder,
  }
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
        v-for="col in cols"
        :key="col.key"
      >
        <SplitterResizeHandle v-if="cols.indexOf(col) !== 0" class="h-8 w-px bg-muted" />
        <SplitterPanel
          :default-size="playlistHeaderPercents[cols.indexOf(col)]"
          :min-size="2"
          class="flex h-8 items-center"
          @click="handleColumnClick(col.id3)"
        >
          <p class="truncate px-2 text-sm">
            {{ col.label }}
          </p>
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
        v-memo="[playlistData.sortBy, playlistData.sortOrder, selectedTrack?.path, playlistHeaderPercents]"
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
            <div v-if="!entry.data.tags.APIC" class="mx-auto grid size-8 place-items-center">
              -
            </div>
            <img
              v-else
              :src="entry.data.thumbnail_uri"
              :alt="entry.data.name"
              width="32"
              height="32"
              class="mx-auto h-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </template>
          <p
            v-else
            class="shrink-0 grow-0 truncate px-2 text-sm"
            :style="{ flexBasis: `calc( (100% - ${(cols.length - 1)}px) * ${playlistHeaderPercents[i]} / 100 )` }"
          >
            {{ col.id3 === 'TIT2' ? entry.data.tags[col.id3] ?? entry.data.name : entry.data.tags[col.id3] }}
          </p>
        </template>
      </div>
    </div>
  </div>
</template>
