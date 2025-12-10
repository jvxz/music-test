<script lang="ts" setup>
const { folderEntries, playlistData } = usePlaylistData()

const { selectedTrack } = useTrackSelection()

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
  overscan: 24,
})

function handleTrackSelection(track: FileEntry) {
  if (selectedTrack.value?.path === track.path) {
    selectedTrack.value = null
  }
  else {
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
  <div class="h-full flex-1" v-bind="containerProps">
    <div v-bind="wrapperProps">
      <table class="w-full table-fixed border-separate border-spacing-0 cursor-default select-none">
        <thead class="sticky top-0 z-20 border-b bg-background">
          <tr class="text-muted-foreground *:h-8 *:px-2 *:text-left *:text-sm *:font-normal *:not-last:border-r">
            <th
              v-for="col in cols"
              :key="col.key"
              :data-sort-order="playlistData.sortOrder"
              :style="{ width: `${col.width}px` }"
              class="group"
              @click="handleColumnClick(col.id3)"
            >
              <div class="flex items-center justify-between">
                <span class="capitalize">{{ col.label }}</span>
                <Icon
                  v-show="playlistData.sortBy === col.id3"
                  name="tabler:chevron-down"
                  class="group-data-[sort-order='asc']:rotate-180"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in list"
            :key="entry.index"
            class="*:h-8 *:border-b *:px-2 *:text-left *:text-sm *:font-normal data-selected:bg-muted"
            :data-selected="selectedTrack?.path !== entry.data.path ? undefined : ''"
            @mousedown="handleTrackSelection(entry.data)"
          >
            <template v-for="col in cols" :key="col.key">
              <td v-if="col.key === 'cover'" :style="{ width: `${col.width}px` }">
                <img
                  :src="entry.data.thumbnail_uri"
                  class="mx-auto h-full object-contain"
                  width="64"
                  height="64"
                  :alt="entry.data.name"
                  decoding="async"
                />
              </td>
              <td
                v-else
                class="truncate"
                :style="{ width: `${col.width}px` }"
              >
                {{ col.default
                  ? entry.data.tags[col.id3] ?? entry.data[col.default]
                  : entry.data.tags[col.id3] }}
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
