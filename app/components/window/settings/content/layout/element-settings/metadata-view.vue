<template>
  <FormSelect
    v-model:model-value="$settings.layout.element.metadataView.trackToView"
    :values="['current-playing-track', 'selected-tracks']"
    label="Track(s) to be displayed"
    :classes="{
      trigger: 'w-lg',
    }"
  />
  <FormSubtitle>Frames</FormSubtitle>
  <WindowSettingsContentLayoutElementSettingsMetadataViewFrames />
</template>
