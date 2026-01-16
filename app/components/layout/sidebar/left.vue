<script lang="ts" setup>
const { layoutPanels } = usePersistentPanels('left', [75, 25])

const { getPanelElements } = useLayout()
const leftPanelElements = getPanelElements('left')
</script>

<template>
  <SplitterGroup
    direction="vertical"
    class="*:not-last:border-b"
    @layout="layoutPanels = $event"
  >
    <template v-for="(element, idx) in leftPanelElements" :key="element">
      <LayoutPanel
        :element="element"
        as-splitter-panel
      />
      <SplitterResizeHandle v-if="idx !== leftPanelElements.length - 1" />
    </template>
  </SplitterGroup>
</template>
