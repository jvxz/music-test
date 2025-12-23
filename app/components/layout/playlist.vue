<script lang="ts" setup>
import { resolveResource } from '@tauri-apps/api/path'

const props = defineProps<{
  type: 'folder' | 'playlist'
  path: string
}>()

const { folderEntries, isLoadingPlaylistData, playlistData, sortBy } = usePlaylist({
  path: props.path,
  type: props.type,
})
const { selectedTrack } = useTrackSelection()
const { playbackStatus, playTrack } = usePlayback()
const { layoutPanels: playlistHeaderPercents } = usePlaylistColumns()

function handleTrackSelection(track: FileEntry) {
  if (selectedTrack.value?.path !== track.path) {
    selectedTrack.value = track
  }
}

const shouldVirtualize = computed(() => folderEntries.value.length >= VIRTUALIZATION_THRESHOLD)

const contextMenuEntry = shallowRef<FileEntry | null>(null)

async function handleDragStart(track: FileEntry) {
  const { value: colorMode } = useColorMode()
  const icon = await resolveResource(`icons/${colorMode === 'light' ? 'file-dark.svg' : 'file-light.svg'}`)

  await startDrag({
    icon,
    item: [track.path],
  })
}
</script>

<template>
  <div class="h-full flex-1 cursor-default select-none">
    <LayoutPlaylistHeader
      :path
      :type
      :track-count="folderEntries.length"
      :is-loading="isLoadingPlaylistData"
    />
    <LayoutPlaylistColumns
      :playlist-data="playlistData"
      @sort-update="(by, order) => sortBy({ key: by, order })"
    />
    <LayoutPlaylistVirtualProvider
      v-if="shouldVirtualize"
      v-slot="{ containerProps, list, wrapperProps }"
      :entries="folderEntries"
    >
      <div class="h-full flex-1 cursor-default select-none" v-bind="containerProps">
        <LayoutPlaylistRowContextMenu :entry="contextMenuEntry">
          <div
            class="grid h-full"
            v-bind="wrapperProps"
            :style="{
              gridTemplateColumns: playlistHeaderPercents.map((p) => `${p}%`).join(' '),
              gridAutoRows: '38px',
            }"
          >
            <LayoutPlaylistRow
              v-for="entry in list"
              :key="entry.data.path"
              v-memo="[
                entry.data.path,
                selectedTrack?.path === entry.data.path,
                playbackStatus?.path === entry.data.path,
              ]"
              :entry="entry.data"
              :is-selected="selectedTrack?.path === entry.data.path"
              :is-playing="playbackStatus?.path === entry.data.path"
              draggable="true"
              @play-track="playTrack(entry.data.path)"
              @select-track="handleTrackSelection(entry.data)"
              @click.right="contextMenuEntry = entry.data"
              @dragstart.prevent="handleDragStart(entry.data)"
            />
          </div>
        </LayoutPlaylistRowContextMenu>
      </div>
    </LayoutPlaylistVirtualProvider>
    <div
      v-else
      class="h-full flex-1 overflow-y-auto"
    >
      <LayoutPlaylistRowContextMenu :entry="contextMenuEntry">
        <div
          class="grid"
          :style="{
            gridTemplateColumns: playlistHeaderPercents.map((p) => `${p}%`).join(' '),
            gridAutoRows: '38px',
          }"
        >
          <LayoutPlaylistRow
            v-for="entry in folderEntries"
            :key="entry.path"
            v-memo="[
              entry.path,
              selectedTrack?.path === entry.path,
              playbackStatus?.path === entry.path,
            ]"
            :entry="entry"
            :is-selected="selectedTrack?.path === entry.path"
            :is-playing="playbackStatus?.path === entry.path"
            draggable="true"
            @play-track="playTrack(entry.path)"
            @select-track="handleTrackSelection(entry)"
            @click.right="contextMenuEntry = entry"
            @dragstart.prevent="handleDragStart(entry)"
          />
        </div>
      </LayoutPlaylistRowContextMenu>
    </div>
  </div>
</template>
