<script lang="ts" setup>
defineProps<{
  class?: string
}>()
</script>

<template>
  <ULabel :class="cn('font-medium ps-1 shrink-0', $props.class)">
    <slot />
  </ULabel>
</template>
