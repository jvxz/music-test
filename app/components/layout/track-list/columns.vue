<script lang="ts" setup>
const { layoutPanels: playlistColumnPercents, openSetDisplayedFieldsWindow } = useTrackListColumns()
const trackListInput = useTrackListInput()

const { getColumnFields } = useTrackListColumns()
const columnFields = getColumnFields('objects')

function handleColumnLeftClick(col: TrackListColumn) {
  if (!col.canSort || !col.id3)
    return

  const sortOrder = col.id3 === trackListInput.value.sortBy ? trackListInput.value.sortOrder === 'Asc' ? 'Desc' : 'Asc' : 'Asc'

  trackListInput.value = {
    ...trackListInput.value,
    sortBy: col.id3,
    sortOrder,
  }
}

const container = useTemplateRef<HTMLElement>('container')
const { barStyles, getDragElementProps } = useDraggable(columnFields, container, {
  direction: 'horizontal',
  doDragGhost: true,
  onDragEnd: (params) => {
    columnFields.value = handleListRearrange(columnFields, params)
  },
})
</script>

<template>
  <UContextMenu>
    <UContextMenuTrigger as-child>
      <SplitterGroup
        :key="columnFields.map(field => field.key).join()"
        ref="container"
        direction="horizontal"
        as-child
        @layout="playlistColumnPercents = $event"
      >
        <div class="group/row z-20 h-8! shrink-0 bg-background">
          <div :style="barStyles" class="absolute w-px bg-primary" />
          <template
            v-for="(col, index) in columnFields"
            :key="col.key"
          >
            <SplitterResizeHandle v-if="index !== 0" class="invisible h-8 w-px bg-muted group-hover/row:visible" />
            <SplitterPanel
              :default-size="playlistColumnPercents[index]"
              :min-size="col.minSize"
              :max-size="col.maxSize"
              as-child
            >
              <div
                class="flex h-8 flex-1 items-center"
                v-bind="getDragElementProps(col)"
                @click="handleColumnLeftClick(col)"
              >
                <p class="truncate px-1.5 text-xs font-medium text-muted-foreground">
                  {{ col.hideLabelInColumn ? '' : col.label }}
                </p>
                <Icon
                  v-if="col.canSort"
                  :name="trackListInput.sortBy === col.id3 ? (trackListInput.sortOrder === 'Asc' ? 'tabler:sort-ascending' : 'tabler:sort-descending') : ''"
                  class="size-3!"
                />
              </div>
            </SplitterPanel>
          </template>
        </div>
      </SplitterGroup>
    </UContextMenuTrigger>
    <UContextMenuContent>
      <UContextMenuItem @click="openSetDisplayedFieldsWindow">
        Set displayed fields...
      </UContextMenuItem>
    </UContextMenuContent>
  </UContextMenu>
</template>
