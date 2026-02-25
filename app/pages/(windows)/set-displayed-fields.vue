<script lang="ts" setup>
import { useFilter } from 'reka-ui'

const { getColumnFields, setColumnFields } = useTrackListColumns()
const columnFields = getColumnFields('objects')

const selectedField = shallowRef<TrackListColumn | null>(null)
const isDragging = shallowRef(false)

const availableListQuery = shallowRef('')
const { contains } = useFilter({ sensitivity: 'base' })

const activeListEl = useTemplateRef<HTMLDivElement>('activeListEl')
const { barStyles: activeListBarStyles, draggingItem: draggingActiveItem, getDragElementProps: activeDragElementProps } = useDraggable(columnFields, activeListEl, {
  _name: 'active',
  class: {
    dragging: 'opacity-50',
  },
  direction: 'vertical',
  doDragGhost: true,
  group: 'col-fields',
  onDragEnd: (params) => {
    columnFields.value = handleListRearrange(columnFields, params)
    isDragging.value = false
  },
  onDragStart: () => isDragging.value = true,
})

const availableListEl = useTemplateRef<HTMLDivElement>('availableListEl')
const { getDragElementProps: availableDragElementProps } = useDraggable(toRef(objectValues(ALL_TRACK_LIST_COLUMNS)), availableListEl, {
  _name: 'available',
  direction: 'vertical',
  doDragGhost: true,
  group: 'col-fields',
  onDragEnd: (params) => {
    if (params.targetItem?._listId === params.prevItem._listId)
      return

    columnFields.value = columnFields.value.filter(f => f.key !== params.prevItem.data.key)
    isDragging.value = false
  },
  onDragStart: () => isDragging.value = true,
})

function handleRemoveField(field: TrackListColumn | null) {
  if (!field)
    return

  setColumnFields(columnFields.value.filter(f => f.key !== field.key).map(f => f.key))
}

const { isOutside: isOutsideAvailableList } = useMouseInElement(availableListEl)
const showDeleteOverlay = computed(() => !!draggingActiveItem.value && !isOutsideAvailableList.value)
</script>

<template>
  <div class="flex gap-2 overflow-hidden p-2">
    <UDraggableShell class="size-full flex-1 p-0">
      <UInput
        v-model="availableListQuery"
        v-no-autocorrect
        leading-icon="tabler:search"
        placeholder="Search available fields..."
        class="shrink-0"
      />
      <UDraggableList ref="availableListEl" class="relative flex size-full flex-col gap-1 overflow-y-auto rounded-sm">
        <div
          v-for="column in ALL_TRACK_LIST_COLUMNS"
          v-show="contains(`${column.label} ${column.key}`, availableListQuery)"
          :key="column.key"
          class="flex w-full shrink-0 active:text-foreground"
          :class="{
            'pointer-events-none': columnFields.some(f => f.key === column.key),
            'opacity-50': showDeleteOverlay,
          }"
          v-bind="availableDragElementProps(column)"
        >
          <UDraggableItem
            :disabled="columnFields.some(f => f.key === column.key)"
            :item="column"
            class="flex-1 rounded-none"
            @pointerdown.right="selectedField = column"
            @click="() => {
              if (!isDragging) columnFields = [...columnFields, column]
            }"
          >
            <span class="truncate">{{ column.label }}</span>
          </UDraggableItem>
        </div>
        <div v-if="showDeleteOverlay" class="pointer-events-none absolute inset-0 grid size-full place-items-center">
          <p class="text-lg font-medium">
            Drop to delete
          </p>
        </div>
      </UDraggableList>
    </UDraggableShell>
    <USeparator orientation="vertical" />
    <UContextMenu>
      <UContextMenuTrigger as-child>
        <UDraggableShell class="w-full flex-1 p-0">
          <div ref="activeListEl" class="flex size-full flex-col gap-1 overflow-y-auto rounded-sm">
            <div :style="activeListBarStyles" class="absolute z-120 h-px bg-muted-foreground" />
            <div
              v-for="item in columnFields"
              :key="item.key"
              class="flex w-full active:text-foreground"
              v-bind="activeDragElementProps(item)"
            >
              <UDraggableItem
                :item="item"
                variant="ghost"
                class="flex-1"
                @pointerdown.right="selectedField = item"
              >
                <span class="truncate">{{ item.label }}</span>
              </UDraggableItem>
              <UButton
                size="icon"
                variant="ghost"
                class="shrink-0 rounded-none transition-none duration-0 active:text-foreground"
                data-no-drag
                @click="handleRemoveField(item)"
              >
                <Icon name="tabler:trash" class="size-3.5!" />
              </UButton>
            </div>
          </div>
        </UDraggableShell>
      </UContextMenuTrigger>
      <UContextMenuContent>
        <UContextMenuItem @click="handleRemoveField(selectedField)">
          Remove
        </UContextMenuItem>
      </UContextMenuContent>
    </UContextMenu>
  </div>
</template>
