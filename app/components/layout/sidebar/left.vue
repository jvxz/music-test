<script lang="ts" setup>
const { layoutPanels } = usePersistentPanels('left', [75, 25])

const { getPanelElements } = useLayout()
const leftPanelElements = getPanelElements('left')
</script>

<template>
  <SplitterGroup
    direction="vertical"
    @layout="layoutPanels = $event"
  >
    <LayoutPanel
      v-for="(element, idx) in leftPanelElements"
      :key="element"
      :element="element"
      as-splitter-panel
      :with-resize-handle="idx !== leftPanelElements.length - 1"
    />
  </SplitterGroup>
</template>
