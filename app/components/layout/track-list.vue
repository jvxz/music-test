<script lang="ts" setup>
import type { TrackListInput } from '~/types'
import { resolveResource } from '@tauri-apps/api/path'
import { OnClickOutside } from '@vueuse/components'

const props = defineProps<TrackListInput & {
  forceVirtualize?: boolean
}>()

const { getTrackList } = useTrackList()
const { checkIsSelected, clearSelectedTrack, setSelectedTrack } = useTrackSelection()
const { playbackStatus, playTrack } = usePlayback()
const { layoutPanels: playlistHeaderPercents } = useTrackListColumns()

const { data: folderEntries, pending: isLoadingPlaylistData } = getTrackList(toRef(props))

const shouldVirtualize = computed(() => folderEntries.value.length >= TRACK_LIST_VIRTUALIZATION_THRESHOLD)

const contextMenuEntry = shallowRef<TrackListEntry | null>(null)

async function handleDragStart(track: TrackListEntry) {
  const icon = await resolveResource(`icons/file-light.svg`)

  await startDrag({
    icon,
    item: [track.path],
  })
}
</script>

<template>
  <div class="flex h-full flex-1 cursor-default flex-col select-none">
    <LayoutTrackListHeader
      :path
      :type
      :track-count="folderEntries.length"
      :is-loading="isLoadingPlaylistData"
    />
    <LayoutTrackListColumns v-bind="props" />
    <OnClickOutside @trigger="clearSelectedTrack">
      <LayoutTrackListVirtualProvider
        v-if="shouldVirtualize || forceVirtualize"
        v-slot="{ containerProps, list, wrapperProps }"
        :entries="folderEntries"
      >
        <div class="h-fit cursor-default select-none" v-bind="containerProps">
          <LayoutTrackListRowContextMenu :entry="contextMenuEntry">
            <div
              class="grid h-full"
              v-bind="wrapperProps"
              :style="{
                gridTemplateColumns: playlistHeaderPercents.map((p) => `${p}%`).join(' '),
                gridAutoRows: `${TRACK_LIST_ITEM_HEIGHT}px`,
              }"
            >
              <LayoutTrackListRow
                v-for="entry in list"
                :key="entry.data.path"
                v-memo="[
                  entry.data.path,
                  checkIsSelected(entry.data, $props),
                  playbackStatus?.path === entry.data.path,
                  entry.data.valid,
                ]"
                :entry="entry.data"
                :is-selected="checkIsSelected(entry.data, $props)"
                :is-playing="playbackStatus?.path === entry.data.path"
                draggable="true"
                @play-track="playTrack(entry.data)"
                @select-track="setSelectedTrack(entry.data, $props)"
                @click.right="contextMenuEntry = entry.data"
                @dragstart.prevent="handleDragStart(entry.data)"
              />
            </div>
          </LayoutTrackListRowContextMenu>
        </div>
      </LayoutTrackListVirtualProvider>
      <div
        v-else
        class="h-fit overflow-y-auto"
      >
        <LayoutTrackListRowContextMenu :entry="contextMenuEntry">
          <div
            class="grid"
            :style="{
              gridTemplateColumns: playlistHeaderPercents.map((p) => `${p}%`).join(' '),
              gridAutoRows: `${TRACK_LIST_ITEM_HEIGHT}px`,
            }"
          >
            <LayoutTrackListRow
              v-for="entry in folderEntries"
              :key="entry.path"
              v-memo="[
                entry.path,
                checkIsSelected(entry, $props),
                playbackStatus?.path === entry.path,
                entry.valid,
              ]"
              :entry="entry"
              :is-selected="checkIsSelected(entry, $props)"
              :is-playing="playbackStatus?.path === entry.path"
              draggable="true"
              @play-track="playTrack(entry)"
              @select-track="setSelectedTrack(entry, $props)"
              @click.right="() => {
                setSelectedTrack(entry, $props)
                contextMenuEntry = entry
              }"
              @dragstart.prevent="handleDragStart(entry)"
            />
          </div>
        </LayoutTrackListRowContextMenu>
      </div>
    </OnClickOutside>
  </div>
</template>
