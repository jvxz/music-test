<script lang="ts" setup>
const props = defineProps<{
  panelKey: LayoutPanelKey
}>()

const { dragMeta, startDrag } = useDrag()
const { getPanelElements } = useLayout()
const panelElements = getPanelElements(props.panelKey)

async function handleDragStart(elementKey: LayoutElementKey, panelKey: LayoutPanelKey) {
  const element = getElementFromKey(elementKey)
  if (!element)
    return

  await startDrag({
    data: {
      elementKey: element.key,
      from: panelKey,
    },
    key: 'layout-element',
  }, {
    item: {
      data: element.key,
      types: ['public.plain-text'],
    },
  })
}

function getElementFromKey(key: LayoutElementKey) {
  return layoutPanelElements.find(element => element.key === key)
}

const { getDropoverProps, handleDragStart: handleSortDragStart } = useSortable(panelElements)
</script>

<template>
  <TauriDragoverProvider
    v-for="element in panelElements"
    :key="element"
    class="flex w-fit flex-col items-center gap-px"
    v-bind="getDropoverProps(element)"
  >
    <UContextMenu>
      <UContextMenuTrigger as-child>
        <UButton
          variant="soft"
          :class="cn('justify-start', dragMeta?.key !== 'layout-element' && 'pointer-events-none')"
          draggable="true"
          @dragstart="handleSortDragStart(element, () => handleDragStart(element, props.panelKey))"
          @dragend="dragMeta = null"
        >
          <Icon name="tabler:grip-vertical" class="size-3.5!" />
          <p>{{ sentenceCase(element) }}</p>
        </UButton>
      </UContextMenuTrigger>
      <UContextMenuContent>
        <UContextMenuItem>
          Remove
        </UContextMenuItem>
        <UContextMenuItem>
          Edit
        </UContextMenuItem>
      </UContextMenuContent>
    </UContextMenu>
  </TauriDragoverProvider>
</template>
