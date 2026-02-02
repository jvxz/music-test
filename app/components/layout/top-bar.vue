<script lang="ts" setup>
const settings = useSettings()
</script>

<template>
  <div class="h-fit border-b">
    <LayoutPanelSplitterGroup panel-key="top" direction="horizontal">
      <LayoutPanel
        v-for="(element, idx) in settings.layout.panel.top.elements"
        :key="element"
        :element="element"
        :with-resize-handle="idx !== settings.layout.panel.top.elements.length - 1"
      />
    </LayoutPanelSplitterGroup>
  </div>
</template>
