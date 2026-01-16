<script lang="ts" setup>
const { getSettingValueRef } = useSettings()
const panelElements = getSettingValueRef('layout.panel.bottom')
</script>

<template>
  <div class="h-32 border-t">
    <LayoutPanel
      v-for="element in panelElements"
      :key="element"
      :element="element"
    />
  </div>
</template>
