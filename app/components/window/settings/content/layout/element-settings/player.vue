<template>
  <FormCheckbox
    v-model:model-value="$settings.layout.element.player.showTrackCover"
    label="Show track cover"
  />
  <FormCheckbox
    v-model:model-value="$settings.layout.element.player.roundTrackCover"
    :disabled="!$settings.layout.element.player.showTrackCover"
    label="Round track cover corners"
  />
  <FormSelect
    v-model:model-value="$settings.layout.element.player.titlePosition"
    :values="['center', 'left']"
    label="Track info position"
  />
  <FormCheckbox
    v-model:model-value="$settings.layout.element.player.marqueeText"
    label="Marquee track info"
  />
  <FormSelect
    v-model:model-value="$settings.layout.element.player.controlsPosition"
    :values="['center', 'left']"
    label="Controls position"
  />
</template>
