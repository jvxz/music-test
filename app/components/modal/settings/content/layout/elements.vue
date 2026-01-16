<script lang="ts" setup>
const { dragMeta, startDrag } = useDrag()
const elementDragging = useState<LayoutElementKey | null>('layout-element-dragging', () => null)

async function handleDragStart(element: (typeof layoutPanelElements)[number]) {
  elementDragging.value = element.key

  await startDrag({
    data: {
      elementKey: element.key,
      from: 'AVAILABLE_ELEMENTS',
    },
    key: 'layout-element',
  }, {
    item: {
      data: element.key,
      types: ['public.plain-text'],
    },
  })
}

const { removeElementFromPanel } = useLayout()

async function handleDrop(meta: DragMetaEntry) {
  if (meta?.key !== 'layout-element')
    return

  if (meta.key === 'layout-element' && meta.data.from === 'AVAILABLE_ELEMENTS')
    return

  // assert because check for invalid key is done above
  removeElementFromPanel(meta.data.from as LayoutPanelKey, meta.data.elementKey)
}
</script>

<template>
  <TauriDragoverProvider
    :acceptable-keys="['layout-element']"
    @drop="handleDrop(dragMeta)"
  >
    <div
      class="flex h-fit w-1/3 flex-col gap-px rounded bg-muted/25 p-1"
      :class="{
        'data-drag-over:bg-danger/25': dragMeta?.key === 'layout-element' && dragMeta.data.from !== 'AVAILABLE_ELEMENTS',
      }"
    >
      <UButton
        v-for="element in layoutPanelElements"
        :key="element.key"
        variant="ghost"
        class="justify-start"
        draggable="true"
        @dragstart="handleDragStart(element)"
        @dragend="elementDragging = null"
      >
        <Icon name="tabler:grip-vertical" class="size-3.5!" />
        <p>{{ element.label }}</p>
      </UButton>
    </div>
  </TauriDragoverProvider>
</template>
