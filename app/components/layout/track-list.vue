<script lang="ts" setup>
import type { TrackListInput } from '~/types'
import { resolveResource } from '@tauri-apps/api/path'
import { OnClickOutside } from '@vueuse/components'

const props = defineProps<TrackListInput & {
  forceVirtualize?: boolean
}>()

const { getTrackList } = useTrackList()
const { playbackStatus, playTrack } = usePlayback()
const { layoutPanels: playlistHeaderPercents } = useTrackListColumns()

let shouldSelectOrDeselect: 'select' | 'deselect' = 'select'
let wasMouseDownOnTrackRow = false
const { checkIsSelected, clearSelectedTracks, editTrackSelection, selectedTrackData } = useTrackSelection()

const { data: folderEntries, pending: isLoadingPlaylistData } = getTrackList(toRef(props))

const shouldVirtualize = computed(() => folderEntries.value.length >= TRACK_LIST_VIRTUALIZATION_THRESHOLD)

const contextMenuEntries = shallowRef<TrackListEntry[] | null>(null)
useEventListener('mouseup', () => {
  wasMouseDownOnTrackRow = false
  contextMenuEntries.value = selectedTrackData.value.entries
})

async function handleDragStart(track: TrackListEntry) {
  const icon = await resolveResource(`icons/file-light.svg`)

  await startDrag({
    icon,
    item: [track.path],
  })
}

async function handleSelectDragStart(entryTriggeredFrom: TrackListEntry) {
  if (wasMouseDownOnTrackRow)
    return

  const isEntryTriggeredFromSelected = checkIsSelected(entryTriggeredFrom)

  shouldSelectOrDeselect = isEntryTriggeredFromSelected ? 'deselect' : 'select'
  wasMouseDownOnTrackRow = true

  editTrackSelection(shouldSelectOrDeselect, entryTriggeredFrom)
}

async function handleDragHoverSelect(entryToEdit: TrackListEntry) {
  if (!wasMouseDownOnTrackRow)
    return

  editTrackSelection(shouldSelectOrDeselect, entryToEdit)
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
    <OnClickOutside @trigger="clearSelectedTracks">
      <LayoutTrackListVirtualProvider
        v-if="shouldVirtualize || forceVirtualize"
        v-slot="{ containerProps, list, wrapperProps }"
        :entries="folderEntries"
      >
        <div class="h-full cursor-default select-none" v-bind="containerProps">
          <LayoutTrackListRowContextMenu :entries="contextMenuEntries">
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
                  checkIsSelected(entry.data),
                  playbackStatus?.path === entry.data.path,
                  entry.data.valid,
                ]"
                :entry="entry.data"
                :is-selected="checkIsSelected(entry.data)"
                :is-playing="playbackStatus?.path === entry.data.path"
                @mousedown.left="handleSelectDragStart(entry.data)"
                @mouseover="handleDragHoverSelect(entry.data)"
                @play-track="playTrack(entry.data)"
              />
            </div>
          </LayoutTrackListRowContextMenu>
        </div>
      </LayoutTrackListVirtualProvider>
      <div
        v-else
        class="h-full overflow-y-auto"
      >
        <LayoutTrackListRowContextMenu :entries="contextMenuEntries">
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
                checkIsSelected(entry),
                playbackStatus?.path === entry.path,
                entry.valid,
              ]"
              :entry="entry"
              :is-selected="checkIsSelected(entry)"
              :is-playing="playbackStatus?.path === entry.path"
              @mousedown.left="handleSelectDragStart(entry)"
              @mouseover="handleDragHoverSelect(entry)"
              @play-track="playTrack(entry)"
              @click.right="() => {
                // setSelectedTrack(entry, $props)
                // contextMenuEntry = entry
              }"
            />
          </div>
        </LayoutTrackListRowContextMenu>
      </div>
    </OnClickOutside>
  </div>
</template>
