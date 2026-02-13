<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { NumberFieldInput } from 'reka-ui'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <NumberFieldInput
    data-slot="input"
    :class="cn(
      'w-full text-center',
      staticStyles.base,
      interactiveStyles.size.default,
      staticStyles.variant.default,
      props.class,
    )"
  />
</template>
