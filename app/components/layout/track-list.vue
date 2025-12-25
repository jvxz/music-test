<script lang="ts" setup>
import type { TrackListInput } from '@/composables/use-track-list'
import { resolveResource } from '@tauri-apps/api/path'

const props = defineProps<TrackListInput>()

const trackListInput = useTrackListInput()
const { getTrackList } = useTrackList()
const { selectedTrack } = useTrackSelection()
const { playbackStatus, playTrack } = usePlayback()
const { layoutPanels: playlistHeaderPercents } = useTrackListColumns()

const { data: folderEntries, pending: isLoadingPlaylistData } = getTrackList(toRef(props))

function handleTrackSelection(track: FileEntry) {
  if (selectedTrack.value?.path !== track.path) {
    selectedTrack.value = track
  }
}

const shouldVirtualize = computed(() => folderEntries.value.length >= TRACK_LIST_VIRTUALIZATION_THRESHOLD)

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
    <LayoutTrackListHeader
      :path
      :type
      :track-count="folderEntries.length"
      :is-loading="isLoadingPlaylistData"
    />
    <LayoutTrackListColumns
      v-bind="props"
      @sort-update="(by, order) => {
        trackListInput.sortBy = by
        trackListInput.sortOrder = order
      }"
    />
    <LayoutTrackListVirtualProvider
      v-if="shouldVirtualize"
      v-slot="{ containerProps, list, wrapperProps }"
      :entries="folderEntries"
    >
      <div class="h-full flex-1 cursor-default select-none" v-bind="containerProps">
        <LayoutTrackListRowContextMenu :entry="contextMenuEntry">
          <div
            class="grid h-full"
            v-bind="wrapperProps"
            :style="{
              gridTemplateColumns: playlistHeaderPercents.map((p) => `${p}%`).join(' '),
              gridAutoRows: '38px',
            }"
          >
            <LayoutTrackListRow
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
        </LayoutTrackListRowContextMenu>
      </div>
    </LayoutTrackListVirtualProvider>
    <div
      v-else
      class="h-full flex-1 overflow-y-auto"
    >
      <LayoutTrackListRowContextMenu :entry="contextMenuEntry">
        <div
          class="grid"
          :style="{
            gridTemplateColumns: playlistHeaderPercents.map((p) => `${p}%`).join(' '),
            gridAutoRows: '38px',
          }"
        >
          <LayoutTrackListRow
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
      </LayoutTrackListRowContextMenu>
    </div>
  </div>
</template>
