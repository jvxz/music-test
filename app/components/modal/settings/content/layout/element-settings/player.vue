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
  <FormSelect
    v-model:model-value="elementSettings.titlePosition"
    :values="['center', 'left']"
    label="Track info position"
  />
  <FormCheckbox
    v-model:model-value="elementSettings.marqueeText"
    label="Marquee track info"
  />
  <FormSelect
    v-model:model-value="elementSettings.controlsPosition"
    :values="['center', 'left']"
    label="Controls position"
  />
</template>
