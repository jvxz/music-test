<script lang="ts" setup>
import type { TrackListInput } from '~/types'
import { OnClickOutside } from '@vueuse/components'

const props = defineProps<TrackListInput & {
  forceVirtualize?: boolean
}>()

const keys = useGlobalKeys()
const { getTrackList } = useTrackList()
const { playbackStatus, playTrack } = usePlayback()
const { layoutPanels: playlistHeaderPercents } = useTrackListColumns()
const { checkIsSelected, clearSelectedTracks, editTrackSelection, selectedTrackData } = useTrackSelection()
const settings = useSettings()

const { getColumnFields } = useTrackListColumns()
const columnFields = getColumnFields('objects')

const { data: folderEntries, pending: isLoadingPlaylistData } = getTrackList(toRef(props))

let allowRowDragStart = false
let isDraggingEntries = false
let entryToSelectInsteadOfDrag: TrackListEntry | null = null
let shouldSelectOrDeselect: 'select' | 'deselect' = 'select'
let wasMouseDownOnTrackRow = false

const shouldVirtualize = computed(() => folderEntries.value.length >= TRACK_LIST_VIRTUALIZATION_THRESHOLD)

const contextMenuEntries = shallowRef<TrackListEntry[] | null>(null)

useEventListener('mouseup', () => {
  wasMouseDownOnTrackRow = false
  allowRowDragStart = false

  if (!isDraggingEntries && entryToSelectInsteadOfDrag) {
    if (keys.ctrl?.value) {
      editTrackSelection('deselect', entryToSelectInsteadOfDrag)
    }
    else {
      clearSelectedTracks()
      editTrackSelection('select', entryToSelectInsteadOfDrag)
    }
    entryToSelectInsteadOfDrag = null
  }

  isDraggingEntries = false
  contextMenuEntries.value = selectedTrackData.value.entries
})

const { startDrag } = useDrag()

async function handleRowDragStart(e: DragEvent, wasEntrySelected: boolean) {
  e.preventDefault()

  if (!allowRowDragStart)
    return

  entryToSelectInsteadOfDrag = null

  if (wasEntrySelected) {
    isDraggingEntries = true
    await startDrag({
      data: {
        entries: selectedTrackData.value.entries,
      },
      key: 'track-list-entry',
    }, {
      item: selectedTrackData.value.entries.map(entry => entry.path),
    })
  }
}

async function handleSelectDragStart(entryTriggeredFrom: TrackListEntry) {
  if (wasMouseDownOnTrackRow)
    return

  const isEntryTriggeredFromSelected = checkIsSelected(entryTriggeredFrom)

  if (!isEntryTriggeredFromSelected) {
    if (keys.ctrl?.value) {
      editTrackSelection('select', entryTriggeredFrom)
    }
    else if (!keys.shift?.value) {
      clearSelectedTracks()
    }
  }

  if (isEntryTriggeredFromSelected) {
    allowRowDragStart = true
    entryToSelectInsteadOfDrag = entryTriggeredFrom
    return
  }

  if (keys.shift?.value && !isEntryTriggeredFromSelected && selectedTrackData.value.entries.length) {
    const idx = folderEntries.value.findIndex(entry => entry.path === entryTriggeredFrom.path)
    if (idx !== -1) {
      const lastSelectedEntryIndex = folderEntries.value.findIndex(entry => entry.path === selectedTrackData.value.entries.at(-1)!.path)

      if (idx >= lastSelectedEntryIndex) {
        const newEntries = folderEntries.value.slice(
          lastSelectedEntryIndex,
          idx,
        )
        selectedTrackData.value.entries = [...selectedTrackData.value.entries, ...newEntries]
      }
      else {
        const newEntries = folderEntries.value.slice(
          idx,
          folderEntries.value.findIndex(entry => entry.path === selectedTrackData.value.entries[0]!.path),
        )
        selectedTrackData.value.entries = [...newEntries, ...selectedTrackData.value.entries]
      }
    }
  }

  shouldSelectOrDeselect = (keys.shift?.value && isEntryTriggeredFromSelected) ? 'deselect' : 'select'
  wasMouseDownOnTrackRow = true

  editTrackSelection(shouldSelectOrDeselect, entryTriggeredFrom)
  allowRowDragStart = false
}

async function handleDragHoverSelect(entryToEdit: TrackListEntry) {
  if (!wasMouseDownOnTrackRow)
    return

  editTrackSelection(shouldSelectOrDeselect, entryToEdit)
}

function handleRightClick(entry: TrackListEntry) {
  const clickedOnSelectedTrack = checkIsSelected(entry)

  if (!clickedOnSelectedTrack || !selectedTrackData.value.entries.length || selectedTrackData.value.entries.length === 1) {
    selectedTrackData.value.entries = [entry]
  }
}

onKeyStrokeSafe('ctrl_a', () => selectedTrackData.value.entries = folderEntries.value)
onKeyStrokeSafe('ctrl_d', () => selectedTrackData.value.entries = [])
</script>

<template>
  <div
    :data-row-style="settings.layout.element.trackList.rowStyle"
    class="group flex h-full flex-1 cursor-default flex-col select-none"
  >
    <LayoutTrackListHeader
      :path
      :type
      :track-count="folderEntries.length"
      :is-loading="isLoadingPlaylistData"
    />
    <LayoutTrackListColumns v-bind="props" />
    <OnClickOutside @trigger="settings.general.clickOutsideToDeselect ? clearSelectedTracks() : null">
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
                  columnFields.map(field => field.key).join(),
                  entry.data.path,
                  checkIsSelected(entry.data),
                  playbackStatus?.path === entry.data.path,
                  entry.data.valid,
                ]"
                draggable="true"
                :entry="entry.data"
                :columns="columnFields"
                :is-selected="checkIsSelected(entry.data)"
                :is-playing="playbackStatus?.path === entry.data.path"
                :is-even="entry.index % 2 === 0"
                @row-drag-start="handleRowDragStart($event, checkIsSelected(entry.data))"
                @mousedown.left="handleSelectDragStart(entry.data)"
                @mouseover="handleDragHoverSelect(entry.data)"
                @play-track="playTrack(entry.data)"
                @mousedown.right="handleRightClick(entry.data)"
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
              v-for="(entry, index) in folderEntries"
              :key="entry.path"
              v-memo="[
                columnFields.map(field => field.key).join(),
                entry.path,
                checkIsSelected(entry),
                playbackStatus?.path === entry.path,
                entry.valid,
              ]"
              draggable="true"
              :entry="entry"
              :columns="columnFields"
              :is-selected="checkIsSelected(entry)"
              :is-playing="playbackStatus?.path === entry.path"
              :is-even="index % 2 === 0"
              @row-drag-start="handleRowDragStart($event, checkIsSelected(entry))"
              @mousedown.left="handleSelectDragStart(entry)"
              @mouseover="handleDragHoverSelect(entry)"
              @play-track="playTrack(entry)"
              @mousedown.right="handleRightClick(entry)"
            />
          </div>
        </LayoutTrackListRowContextMenu>
      </div>
    </OnClickOutside>
  </div>
</template>
