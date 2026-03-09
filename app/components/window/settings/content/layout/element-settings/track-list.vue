<template>
  <FormSelect
    v-model:model-value="$settings.layout.element.trackList.rowStyle"
    :values="['bordered', 'alternating', 'none']"
    label="Row style"
  />
  <FormCheckbox
    v-model:model-value="$settings.layout.element.trackList.showScrollbarGutter"
    label="Always show scrollbar gutter"
  />
  <FormCheckbox
    v-model:model-value="$settings.layout.element.trackList.deriveYearFromTDRC"
    label="Derive year from recording date (TDRC) when no year (TYER) is present"
  />
</template>
