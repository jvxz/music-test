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
const { layoutPanels: playlistHeaderPercents } = usePlaylistColumns()

function handleTrackSelection(track: FileEntry) {
  if (selectedTrack.value?.path !== track.path) {
    selectedTrack.value = track
  }
}

const shouldVirtualize = computed(() => folderEntries.value.length >= VIRTUALIZATION_THRESHOLD)
</script>

<template>
  <div class="h-full flex-1 cursor-default select-none">
    <LayoutPlaylistHeader :path :track-count="folderEntries.length" />
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
        <div
          class="grid h-full"
          v-bind="wrapperProps"
          :style="{
            gridTemplateColumns: playlistHeaderPercents.map((p, i) => `${p}%`).join(' '),
            gridAutoRows: '38px',
          }"
        >
          <LayoutPlaylistRow
            v-for="entry in list"
            :key="entry.index"
            v-memo="[
              entry.data.path,
              selectedTrack?.path === entry.data.path,
              playbackStatus?.path === entry.data.path,
            ]"
            :entry="entry.data"
            :is-selected="selectedTrack?.path === entry.data.path"
            :is-playing="playbackStatus?.path === entry.data.path"
            @play-track="playTrack(entry.data.path)"
            @select-track="handleTrackSelection(entry.data)"
          />
        </div>
      </div>
    </LayoutPlaylistVirtualProvider>
    <div
      v-else
      class="h-full flex-1 overflow-y-auto"
    >
      <div
        class="grid"
        :style="{
          gridTemplateColumns: playlistHeaderPercents.map((p, i) => `${p}%`).join(' '),
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
          @play-track="playTrack(entry.path)"
          @select-track="handleTrackSelection(entry)"
        />
      </div>
    </div>
  </div>
</template>
