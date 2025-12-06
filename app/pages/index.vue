<script lang="ts" setup>
const { rpc } = useTauri()
const { execute, state: res } = useAsyncState((path: string) => rpc.read_folder(path), [])

const cols: { id3: string, key: string, label: string, default?: keyof FileEntry }[] = [
  {
    id3: 'APIC',
    key: 'cover',
    label: '',
  },
  {
    default: 'name',
    id3: 'TIT2',
    key: 'title',
    label: 'Title',
  },
  {
    id3: 'TPE1',
    key: 'artist',
    label: 'Artist',
  },
  {
    id3: 'TALB',
    key: 'album',
    label: 'Album',
  },
  {
    id3: 'TYER',
    key: 'year',
    label: 'Year',
  },
  {
    id3: 'TCON',
    key: 'genre',
    label: 'Genre',
  },
  {
    id3: 'TRCK',
    key: 'track',
    label: 'Track',
  },
] as const
</script>

<template>
  <div class="flex h-full flex-col gap-4 overflow-x-hidden overflow-y-auto *:shrink-0">
    <UInput placeholder="Enter path" @keydown.enter="execute(0, $event.target.value)" />
    <table class="w-full">
      <thead class="border-b">
        <tr class="h-7 text-xs text-muted-foreground *:px-2 *:text-left *:font-mono *:font-normal *:not-last:border-r">
          <th v-for="col in cols" :key="col.key">
            <span class="capitalize">{{ col.label }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in res"
          :key="entry.path"
          class="h-8 *:px-2 *:text-left *:text-sm *:font-normal *:not-last:border-r"
        >
          <template v-for="col in cols" :key="col.key">
            <td v-if="col.key === 'cover'"></td>
            <td v-else>
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
