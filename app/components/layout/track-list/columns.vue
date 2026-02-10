<script lang="ts" setup>
const { layoutPanels: playlistColumnPercents, openSetDisplayedFieldsWindow } = useTrackListColumns()
const trackListInput = useTrackListInput()

const { getColumnFields } = useTrackListColumns()
const columnFields = getColumnFields('objects')

function handleColumnLeftClick(col: typeof TRACK_LIST_COLUMNS[number]) {
  if (!col.canSort || !col.id3)
    return

  const sortOrder = col.id3 === trackListInput.value.sortBy ? trackListInput.value.sortOrder === 'Asc' ? 'Desc' : 'Asc' : 'Asc'

  trackListInput.value = {
    ...trackListInput.value,
    sortBy: col.id3,
    sortOrder,
  }
}
</script>

<template>
  <UContextMenu>
    <UContextMenuTrigger as-child>
      <SplitterGroup
        :key="columnFields.map(field => field.key).join()"
        direction="horizontal"
        class="group z-20 h-8! shrink-0 bg-background"
        @layout="playlistColumnPercents = $event"
      >
        <template
          v-for="(col, index) in columnFields"
          :key="col.key"
        >
          <SplitterResizeHandle v-if="index !== 0" class="invisible h-8 w-px bg-muted group-hover:visible" />
          <SplitterPanel
            :default-size="playlistColumnPercents[index]"
            :min-size="col.minSize"
            :max-size="col.maxSize"
            class="flex h-8 items-center"
            @pointerdown.left="handleColumnLeftClick(col)"
          >
            <p class="truncate px-1.5 text-xs font-medium text-muted-foreground">
              {{ col.hideLabelInColumn ? '' : col.label }}
            </p>
            <Icon
              v-if="col.canSort"
              :name="trackListInput.sortBy === col.id3 ? (trackListInput.sortOrder === 'Asc' ? 'tabler:sort-ascending' : 'tabler:sort-descending') : ''"
              class="size-3!"
            />
          </SplitterPanel>
        </template>
      </SplitterGroup>
    </UContextMenuTrigger>
    <UContextMenuContent>
      <UContextMenuItem @click="openSetDisplayedFieldsWindow">
        Set displayed fields...
      </UContextMenuItem>
    </UContextMenuContent>
  </UContextMenu>
</template>
