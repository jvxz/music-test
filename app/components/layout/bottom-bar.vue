<script lang="ts" setup>
const settings = useSettings()
</script>

<template>
  <div class="h-fit border-t">
    <LayoutPanelSplitterGroup panel-key="bottom" direction="horizontal">
      <LayoutPanel
        v-for="(element, idx) in settings.layout.panel.bottom.elements"
        :key="element"
        :element="element"
        :with-resize-handle="idx !== settings.layout.panel.bottom.elements.length - 1"
      />
    </LayoutPanelSplitterGroup>
  </div>
</template>
