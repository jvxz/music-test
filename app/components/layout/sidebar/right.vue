<script lang="ts" setup>
const { getPanelElements } = useLayout()
const rightPanelElements = getPanelElements('right')
</script>

<template>
  <SplitterGroup direction="vertical">
    <template v-for="(element, idx) in rightPanelElements" :key="element">
      <SplitterPanel class="flex h-full flex-1 flex-col">
        <LayoutPanel
          :key="element"
          :element="element"
        />
      </SplitterPanel>
      <SplitterResizeHandle v-if="idx !== rightPanelElements.length - 1" class="bg-border h-px" />
    </template>
  </SplitterGroup>
</template>
