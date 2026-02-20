<script lang="ts" setup>
defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cn('flex flex-col gap-2 overflow-y-auto p-4', $props.class)">
    <slot />
  </div>
</template>
