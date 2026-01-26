<script lang="ts" setup>
const { getElementSettings } = useLayout()
const elementSettings = getElementSettings('track-list')
</script>

<template>
  <FormSelect
    v-model:model-value="elementSettings.rowStyle"
    :values="['bordered', 'alternating', 'none']"
    label="Row style"
  />
</template>
