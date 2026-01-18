<script lang="ts" setup>
const { dragMeta } = useDrag()
const { addElementToPanel, elementDragging, getAllPanelElements, removeElementFromPanel } = useLayout()

const panelElements = getAllPanelElements()

function isDraggingAllowedElement(dragMeta: DragMetaEntry, panel: LayoutPanel) {
  if (!elementDragging.value)
    return false

  if (dragMeta?.key !== 'layout-element')
    return false

  return !(panel.allowedElements as LayoutElementKey[]).includes(elementDragging.value)
}

function isDraggingFromSamePanel(panel: LayoutPanel) {
  if (!elementDragging.value || !dragMeta.value)
    return false

  return dragMeta.value.key === 'layout-element' && dragMeta.value.data.from !== panel.key
}

function handleDrop(meta: DragMetaEntry, panelKey: LayoutPanelKey) {
  if (meta?.key !== 'layout-element')
    return

  if (meta.data.from === panelKey)
    return

  if (meta.data.from !== 'AVAILABLE_ELEMENTS') {
    removeElementFromPanel(meta.data.from, meta.data.elementKey)
  }

  addElementToPanel(panelKey, meta.data.elementKey)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <TauriDragoverProvider
      v-for="panel in layoutPanels"
      v-slot="{ dragMeta }"
      :key="panel.label"
      :acceptable-keys="['layout-element']"
      @drop="handleDrop(dragMeta, panel.key)"
    >
      <div
        class="-m-2 flex items-start gap-2 overflow-hidden rounded p-2"
        :class="{
          'pointer-events-none opacity-50': isDraggingAllowedElement(dragMeta, panel),
          'data-drag-over:bg-muted/50': isDraggingFromSamePanel(panel) && !isDraggingAllowedElement(dragMeta, panel),
        }"
      >
        <div class="flex flex-col gap-2">
          <UContextMenu>
            <UContextMenuTrigger>
              <div class="flex aspect-video w-24 rounded border">
                <div :class="panel.class" />
              </div>
            </UContextMenuTrigger>
            <UContextMenuContent>
              <UContextMenuItem>
                Reset to default
              </UContextMenuItem>
              <UContextMenuItem>
                Clear all elements
              </UContextMenuItem>
            </UContextMenuContent>
          </UContextMenu>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <ULabel>
              {{ panel.label }}
            </ULabel>
          </div>
          <p v-if="!panelElements[panel.key].length" class="text-sm text-muted-foreground">
            (hidden, no elements contained)
          </p>
          <div v-else class="flex flex-col gap-1">
            <ModalSettingsContentLayoutPanelsElements :panel-key="panel.key" />
          </div>
        </div>
      </div>
    </TauriDragoverProvider>
  </div>
</template>
