<script lang="ts" setup>
import { useDraggable } from 'vue-draggable-plus'

const { getColumnFields, setColumnFields } = useTrackListColumns()
const columnFields = getColumnFields('objects')

const activeListEl = useTemplateRef<HTMLDivElement>('activeListEl')
useDraggable(activeListEl, columnFields, {
  animation: 0,
  direction: 'vertical',
  fallbackOnBody: true,
  forceFallback: true,
  group: {
    name: 'col-fields',
  },
})

const availableListEl = useTemplateRef<HTMLDivElement>('availableListEl')
useDraggable(availableListEl, toRef(objectValues(ALL_TRACK_LIST_COLUMNS)), defineDraggableOptions('col-fields', {
  draggableOpts: {
    direction: 'vertical',
  },
  sourceOnly: true,
}))

const selectedField = shallowRef<TrackListColumn | null>(null)

function handleRemoveField(field: TrackListColumn | null) {
  if (!field)
    return

  setColumnFields(columnFields.value.filter(f => f.key !== field.key).map(f => f.key))
}
</script>

<template>
  <div class="flex gap-2 p-2">
    <UDraggableShell class="h-full w-full flex-1 px-0">
      <UDraggableLabel class="justify-center">
        Available
      </UDraggableLabel>
      <UDraggableList ref="availableListEl" class="flex h-full w-full flex-col overflow-y-auto rounded">
        <div
          v-for="column in ALL_TRACK_LIST_COLUMNS"
          :key="column.key"
          draggable="true"
          class="flex w-full shrink-0 active:text-foreground"
        >
          <UDraggableItem
            :item="column"
            class="flex-1 rounded-none"
            @pointerdown.right="selectedField = column"
          >
            <span class="truncate">{{ column.label }}</span>
          </UDraggableItem>
        </div>
      </UDraggableList>
    </UDraggableShell>
    <USeparator orientation="vertical" />
    <UContextMenu>
      <UContextMenuTrigger as-child>
        <UDraggableShell class="h-full w-full flex-1 px-0">
          <UDraggableLabel class="justify-center">
            Selected
          </UDraggableLabel>
          <UDraggableList ref="activeListEl" class="flex h-full w-full flex-col overflow-y-auto rounded">
            <div
              v-for="item in columnFields"
              :key="item.key"
              draggable="true"
              class="flex w-full active:text-foreground"
            >
              <UDraggableItem
                :item="item"
                class="flex-1 rounded-none"
                @pointerdown.right="selectedField = item"
              >
                <span class="truncate">{{ item.label }}</span>
              </UDraggableItem>
              <UButton
                size="icon"
                variant="ghost"
                class="shrink-0 rounded-none transition-none duration-0 active:text-foreground"
                @click="handleRemoveField(item)"
              >
                <Icon name="tabler:trash" class="size-3.5!" />
              </UButton>
            </div>
          </UDraggableList>
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

<style scoped>
@reference '@/assets/css/globals.css';

.sortable-ghost {
  @apply bg-muted text-foreground;
}
</style>
