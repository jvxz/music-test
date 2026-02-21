<script lang="ts" setup>
defineProps<{
  class?: string
}>()
</script>

<template>
  <ULabel :class="cn('shrink-0 ps-1 font-medium', $props.class)">
    <slot />
  </ULabel>
</template>
