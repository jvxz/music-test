<script lang="ts" setup>
const { rpc } = useTauri()

const path = ref('')

const { execute: getFolderEntries, state: folderEntries } = useAsyncState(() => rpc.read_folder(path.value), [])

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
</script>

<template>
  <div class="flex h-full flex-col overflow-x-hidden overflow-y-auto *:shrink-0">
    <UInput
      v-model="path"
      placeholder="Enter path"
      @keydown.enter="getFolderEntries()"
    />
    <table class="w-full">
      <thead class="border-b">
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
          v-for="entry in folderEntries"
          :key="entry.path"
          class="*:h-8 *:px-2 *:text-left *:text-sm *:font-normal *:border-r *:border-b"
        >
          <template v-for="col in cols" :key="col.key">
            <td v-if="col.key === 'cover'" :style="{ width: `${col.width}px` }">
              <NuxtImg
                :src="buildCoverUri(entry.path)"
                class="mx-auto h-full object-contain"
                width="48"
                height="48"
                placeholder="cover.svg"
                loading="lazy"
              />
            </td>
            <td v-else :style="{ width: `${col.width}px` }">
              {{ col.default
                ? entry.tags[col.id3] ?? entry[col.default]
                : entry.tags[col.id3] }}
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
img[src*='cover.svg'] {
  opacity: 80%;
}

.dark img[src*='cover.svg'] {
  filter: invert();
}
</style>
