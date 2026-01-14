<script lang="ts" setup>
const { startDrag } = useDrag()
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
</script>

<template>
  <TauriDragoverProvider v-slot="{ dragMeta }" :acceptable-keys="['layout-element']">
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
