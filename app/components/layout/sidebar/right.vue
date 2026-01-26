<script lang="ts" setup>
const { getPanelElements, getPanelElementSizes } = useLayout()

const rightPanelElements = getPanelElements('right')
const rightPanelElementSizes = getPanelElementSizes('right')
</script>

<template>
  <LayoutPanelSplitterGroup
    panel-key="right"
    direction="vertical"
  >
    <LayoutPanel
      v-for="(element, idx) in rightPanelElements"
      :key="element"
      :element="element"
      as-splitter-panel
      :with-resize-handle="idx !== rightPanelElements.length - 1"
      :default-size="rightPanelElementSizes[idx]"
    />
  </LayoutPanelSplitterGroup>
</template>
