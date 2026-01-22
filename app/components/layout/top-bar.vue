<script lang="ts" setup>
const { getSettingValueRef } = useSettings()
const panelElements = getSettingValueRef('layout.panel.top')
</script>

<template>
  <div class="h-32 border-b">
    <LayoutPanelSplitterGroup panel-key="top" direction="horizontal">
      <LayoutPanel
        v-for="(element, idx) in panelElements"
        :key="element"
        :element="element"
        :with-resize-handle="idx !== panelElements.length - 1"
      />
    </LayoutPanelSplitterGroup>
  </div>
</template>
