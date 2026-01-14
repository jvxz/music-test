<script lang="ts" setup>
const { startDrag } = useDrag()
const elementDragging = useState<LayoutElementKey | null>('layout-element-dragging', () => null)

async function handleDragStart(element: (typeof layoutPanelElements)[number]) {
  elementDragging.value = element.key

  await startDrag({
    data: {
      elementKey: element.key,
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
  <div class="flex h-full w-1/3 flex-col gap-px">
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
</template>
