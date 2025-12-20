<script lang="ts" setup>
const props = defineProps<{
  playlistData: PlaylistData
}>()

const emit = defineEmits<{
  sortUpdate: [key: SortBy, order: SortOrder]
}>()

const { layoutPanels: playlistColumnPercents } = usePlaylistColumns()

const columnMinSizeMap: Record<typeof PLAYLIST_COLUMNS[number]['key'], number> = {
  cover: 3,
  playing: 1.5,
}

function handleColumnClick(col: typeof PLAYLIST_COLUMNS[number]) {
  if (!col.canSort || !col.id3)
    return

  const sortOrder = col.id3 === props.playlistData.sortBy ? props.playlistData.sortOrder === 'Asc' ? 'Desc' : 'Asc' : 'Asc'

  emit('sortUpdate', col.id3, sortOrder)
}
</script>

<template>
  <SplitterGroup
    direction="horizontal"
    class=" z-20 h-8! bg-background group"
    @layout="playlistColumnPercents = $event"
  >
    <template
      v-for="(col, index) in PLAYLIST_COLUMNS"
      :key="col.key"
    >
      <SplitterResizeHandle v-if="index !== 0" class="h-8 w-px bg-muted group-hover:visible invisible" />
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
          :name="playlistData.sortBy === col.id3 ? (playlistData.sortOrder === 'Asc' ? 'tabler:sort-ascending' : 'tabler:sort-descending') : ''"
          class="size-3!"
        />
      </SplitterPanel>
    </template>
  </SplitterGroup>
</template>
