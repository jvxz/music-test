<script lang="ts" setup>
const { getSettingValueRef } = useSettings()
const panelElements = getSettingValueRef('layout.panel.bottom')
</script>

<template>
  <div class="h-fit border-t">
    <LayoutPanelSplitterGroup panel-key="bottom" direction="horizontal">
      <LayoutPanel
        v-for="(element, idx) in panelElements"
        :key="element"
        :element="element"
        :with-resize-handle="idx !== panelElements.length - 1"
      />
    </LayoutPanelSplitterGroup>
  </div>
</template>
