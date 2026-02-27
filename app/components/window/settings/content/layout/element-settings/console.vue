<script lang="ts" setup>
const monoTokens = ['timestamp', 'message'] as const
</script>

<template>
  <FormSubtitle>
    Console
  </FormSubtitle>
  <FormPrimitive label="Use mono font for:" class="pb-2">
    <FormCheckbox
      v-for="token in monoTokens"
      :key="token"
      v-model:model-value="$settings.layout.element.console[`${token}Mono`]"
      :value="token"
      :label="upperFirst(token)"
    />
  </FormPrimitive>
  <FormCheckbox v-model:model-value="$settings.layout.element.console.wrapText" label="Wrap text" />
</template>
