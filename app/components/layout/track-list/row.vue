<script lang="ts" setup>
defineProps<{
  entry: TrackListEntry
  isSelected: boolean
  isPlaying: boolean
  isEven: boolean
}>()

const emits = defineEmits<{
  playTrack: [track: TrackListEntry]
  rowDragStart: [e: DragEvent]
  textDragStart: [e: DragEvent]
}>()

const classes = 'flex items-center'

function getCellContent(entry: TrackListEntry, frame: Id3FrameId | undefined) {
  if (frame === 'TIT2') {
    if (entry.valid) {
      return entry.tags[frame] ?? entry.name
    }

    return entry.path
  }

  if (entry.valid && frame) {
    return entry.tags[frame]
  }

  return ''
}
</script>

<template>
  <div
    class="col-span-full grid grid-cols-subgrid group-data-[row-style=bordered]:not-last:gap-0 group-data-[row-style=bordered]:not-last:border-b group-data-[row-style=alternating-background]:data-is-even:bg-muted/25"
    :class="{
      'border-transparent bg-primary/25!': isSelected,
      'bg-danger/20': !entry.valid,
    }"
    v-bind="$attrs"
    :data-is-even="isEven ? '' : undefined"
    @dblclick.left="emits('playTrack', entry)"
    @dragstart="emits('rowDragStart', $event)"
  >
    <template
      v-for="col in TRACK_LIST_COLUMNS"
      :key="col.key"
    >
      <!-- cover column -->
      <template v-if="col.key === 'cover'">
        <div
          v-if="!entry.valid"
          class="mx-auto justify-center"
          :class="classes"
          @dragstart="emits('textDragStart', $event)"
        >
          -
        </div>
        <div
          v-else-if="!entry.tags.APIC"
          class="mx-auto justify-center"
          :class="classes"
          @dragstart="emits('textDragStart', $event)"
        >
          -
        </div>

        <img
          v-else
          :src="entry.thumbnail_uri"
          :alt="entry.name"
          :width="TRACK_LIST_ITEM_HEIGHT"
          :height="TRACK_LIST_ITEM_HEIGHT"
          class="mx-auto h-full"
          @dragstart="emits('textDragStart', $event)"
        />
      </template>
      <!-- playing column -->
      <div
        v-else-if="col.key === 'playing'"
        :class="classes"
        class="justify-center"
        @dragstart="emits('textDragStart', $event)"
      >
        <Icon
          v-if="isPlaying"
          name="tabler:player-play-filled"
          class="size-3!"
        />
      </div>
      <!-- other columns -->
      <p
        v-else
        :class="classes"
        class="truncate px-2 text-sm"
        :title="getCellContent(entry, col.id3)"
        @dragstart="emits('textDragStart', $event)"
      >
        {{ getCellContent(entry, col.id3) }}
      </p>
    </template>
  </div>
</template>
