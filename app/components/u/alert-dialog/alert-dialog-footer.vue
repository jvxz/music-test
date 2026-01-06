<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    :class="
      cn(
        'flex gap-2 flex-row justify-end',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
