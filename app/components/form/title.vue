<script lang="ts" setup>
defineProps<{
  class?: string
}>()
</script>

<template>
  <ULabel :class="cn('text-xl font-medium', $props.class)">
    <slot />
  </ULabel>
</template>
