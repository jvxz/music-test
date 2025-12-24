<script lang="ts" setup>
const props = defineProps<{
  trackListData: TrackListData
}>()

const emit = defineEmits<{
  sortUpdate: [key: SortBy, order: SortOrder]
}>()

const { layoutPanels: playlistColumnPercents } = useTrackListColumns()

const columnMinSizeMap: Record<typeof TRACK_LIST_COLUMNS[number]['key'], number> = {
  cover: 3,
  playing: 1.5,
}

function handleColumnClick(col: typeof TRACK_LIST_COLUMNS[number]) {
  if (!col.canSort || !col.id3)
    return

  const sortOrder = col.id3 === props.trackListData.sortBy ? props.trackListData.sortOrder === 'Asc' ? 'Desc' : 'Asc' : 'Asc'

  emit('sortUpdate', col.id3, sortOrder)
}
</script>

<template>
  <SplitterGroup
    direction="horizontal"
    class="group z-20 h-8! bg-background"
    @layout="playlistColumnPercents = $event"
  >
    <template
      v-for="(col, index) in TRACK_LIST_COLUMNS"
      :key="col.key"
    >
      <SplitterResizeHandle v-if="index !== 0" class="invisible h-8 w-px bg-muted group-hover:visible" />
      <SplitterPanel
        :default-size="playlistColumnPercents[index]"
        :min-size="columnMinSizeMap[col.key] ?? 4"
        class="flex h-8 items-center"
        @pointerdown="handleColumnClick(col)"
      >
        <p class="truncate px-1.5 text-xs font-medium text-muted-foreground">
          {{ col.label }}
        </p>
        <Icon
          v-if="col.canSort"
          :name="trackListData.sortBy === col.id3 ? (trackListData.sortOrder === 'Asc' ? 'tabler:sort-ascending' : 'tabler:sort-descending') : ''"
          class="size-3!"
        />
      </SplitterPanel>
    </template>
  </SplitterGroup>
</template>
