<script lang="ts" setup>
const { rpc } = useTauri()

const path = ref('')

const { execute: getFolderEntries, state: folderEntries } = useAsyncState(() => rpc.read_folder(path.value), [])
watchEffect(() => {
  console.log('folderEntries: ', folderEntries.value)
})
const { selectedTrack } = useTrackSelection()

const cols: {
  id3: string
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
</script>

<template>
  <!-- <UInput
    v-model="path"
    placeholder="Enter path"
    @keydown.enter="getFolderEntries()"
  /> -->
  <div class="flex h-full flex-col overflow-x-hidden *:shrink-0">
    <div class="h-full flex-1" v-bind="containerProps">
      <div v-bind="wrapperProps">
        <table class="w-full table-fixed border-separate border-spacing-0 select-none">
          <thead class="sticky top-0 z-20 border-b bg-background">
            <tr class="text-muted-foreground *:h-8 *:px-2 *:text-left *:font-mono *:text-sm *:font-normal *:not-last:border-r">
              <th
                v-for="col in cols"
                :key="col.key"
                :style="{ width: `${col.width}px` }"
              >
                <span class="capitalize">{{ col.label }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in list"
              :key="entry.index"
              class="*:h-8 *:border-r *:border-b *:px-2 *:text-left *:text-sm *:font-normal data-selected:bg-muted"
              :data-selected="selectedTrack?.path !== entry.data.path ? undefined : ''"
              @mousedown="handleTrackSelection(entry.data)"
            >
              <template v-for="col in cols" :key="col.key">
                <td v-if="col.key === 'cover'" :style="{ width: `${col.width}px` }">
                  <img
                    :src="buildCoverUri(entry.data.path)"
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
    <LayoutPlayer />
  </div>
</template>

<style scoped>
img[src*='/cover.svg'] {
  opacity: 80%;
}

.dark img[src*='/cover.svg'] {
  filter: invert();
}
</style>
