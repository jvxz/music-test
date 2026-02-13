<script lang="ts" setup>
defineProps<{
  class?: string
}>()
</script>

<template>
  <div class="space-y-1 not-first:pt-2 shrink-0">
    <ULabel :class="cn('text-lg font-medium', $props.class)">
      <slot />
    </ULabel>
    <USeparator />
  </div>
</template>
