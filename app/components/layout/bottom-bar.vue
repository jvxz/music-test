<script lang="ts" setup>
const { getSettingValueRef } = useSettings()
const panelElements = getSettingValueRef('layout.panel.bottom')
</script>

<template>
  <div class="h-32 border-t">
    <SplitterGroup direction="horizontal">
      <LayoutPanel
        v-for="(element, idx) in panelElements"
        :key="element"
        :element="element"
        :with-resize-handle="idx !== panelElements.length - 1"
      />
    </SplitterGroup>
  </div>
</template>
