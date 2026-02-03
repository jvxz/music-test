<template>
  <FormSelect
    v-model:model-value="$settings.layout.element.trackList.rowStyle"
    :values="['bordered', 'alternating', 'none']"
    label="Row style"
  />
</template>
