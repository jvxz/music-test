<script lang="ts" setup>
import { useFilter } from 'reka-ui'

const settings = useSettings()

const selectedField = shallowRef<Id3FrameId | null>(null)
const isDragging = shallowRef(false)

const availableListQuery = shallowRef('')
const { contains } = useFilter({ sensitivity: 'base' })

const fields = computed(() => settings.layout.element.metadataView.frames)

const activeListEl = useTemplateRef<HTMLDivElement>('activeListEl')
const { barStyles: activeListBarStyles, draggingItem: draggingActiveItem, getDragElementProps: activeDragElementProps } = useDraggable(
  fields,
  activeListEl,
  {
    class: {
      dragging: 'opacity-50',
    },
    direction: 'vertical',
    doDragGhost: true,
    group: 'metadata-view-frames',
    onDragEnd: (params) => {
      settings.layout.element.metadataView.frames = handleListRearrange(settings.layout.element.metadataView.frames, params)
      isDragging.value = false
    },
    onDragStart: () => isDragging.value = true,
  },
)

const availableListEl = useTemplateRef<HTMLDivElement>('availableListEl')
const { getDragElementProps: availableDragElementProps } = useDraggable(toRef(objectKeys(ID3_MAP)), availableListEl, {
  direction: 'vertical',
  doDragGhost: true,
  group: 'metadata-view-frames',
  onDragEnd: (params) => {
    if (params.targetItem?._listId === params.prevItem._listId)
      return

    settings.layout.element.metadataView.frames = settings.layout.element.metadataView.frames.filter(f => f !== params.prevItem.data)
    isDragging.value = false
  },
  onDragStart: () => isDragging.value = true,
})

function handleRemoveField(field: Id3FrameId | null) {
  if (!field)
    return

  settings.layout.element.metadataView.frames = settings.layout.element.metadataView.frames.filter(f => f !== field)
}

const { isOutside: isOutsideAvailableList } = useMouseInElement(availableListEl)
const showDeleteOverlay = computed(() => !!draggingActiveItem.value && !isOutsideAvailableList.value)
</script>

<template>
  <div class="flex gap-2 overflow-hidden">
    <UDraggableShell class="size-full flex-1 p-0">
      <UInput
        v-model="availableListQuery"
        v-no-autocorrect
        leading-icon="tabler:search"
        placeholder="Search available frames..."
        class="shrink-0"
      />
      <UDraggableList ref="availableListEl" class="relative flex size-full flex-col gap-1 overflow-y-auto rounded">
        <div
          v-for="frame in objectKeys(ID3_MAP)"
          v-show="contains(`${frame} ${ID3_MAP[frame]}`, availableListQuery)"
          :key="frame"
          class="flex w-full shrink-0 active:text-foreground"
          :class="{
            'pointer-events-none': fields.some(f => f === frame),
            'opacity-50': showDeleteOverlay,
          }"
          v-bind="availableDragElementProps(frame)"
        >
          <UDraggableItem
            :disabled="fields.some(f => f === frame)"
            :item="frame"
            class="flex-1 rounded-none"
            @pointerdown.right="selectedField = frame"
            @click="() => {
              if (!isDragging) settings.layout.element.metadataView.frames = [...fields, frame]
            }"
          >
            <span class="truncate">{{ ID3_MAP[frame] }}</span>
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
          <div ref="activeListEl" class="flex size-full flex-col gap-1 overflow-y-auto rounded">
            <div :style="activeListBarStyles" class="absolute z-120 h-px bg-muted-foreground" />
            <div
              v-for="item in fields"
              :key="item"
              class="flex w-full active:text-foreground"
              v-bind="activeDragElementProps(item)"
            >
              <UDraggableItem
                :item="item"
                variant="ghost"
                class="flex-1"
                @pointerdown.right="selectedField = item"
              >
                <span class="truncate">{{ ID3_MAP[item] }}</span>
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
