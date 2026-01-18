<script lang="ts" setup>
const { getPanelElements, getPanelElementSizes } = useLayout()

const leftPanelElements = getPanelElements('left')
const leftPanelElementSizes = getPanelElementSizes('left')
</script>

<template>
  <LayoutPanelSplitterGroup
    panel-key="left"
    direction="vertical"
  >
    <LayoutPanel
      v-for="(element, idx) in leftPanelElements"
      :key="element"
      :element="element"
      as-splitter-panel
      :with-resize-handle="idx !== leftPanelElements.length - 1"
      :default-size="leftPanelElementSizes[idx]"
    />
  </LayoutPanelSplitterGroup>
</template>
