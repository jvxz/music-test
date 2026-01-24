<script lang="ts" setup>
const { getElementSettings } = useLayout()
const elementSettings = getElementSettings('player')
</script>

<template>
  <FormCheckbox
    v-model:model-value="elementSettings.showTrackCover"
    label="Show track cover"
  />
  <FormCheckbox
    v-model:model-value="elementSettings.roundTrackCover"
    :disabled="!elementSettings.showTrackCover"
    label="Round track cover corners"
  />
</template>
