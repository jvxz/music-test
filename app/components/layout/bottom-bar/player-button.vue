<script lang="ts" setup>
const props = withDefaults(defineProps<{
  class?: string
  variant?: 'sub' | 'main'
}>(), {
  variant: 'sub',
})
</script>

<template>
  <button v-if="variant === 'sub'" :class="cn('flex size-8 items-center justify-center active:text-muted-foreground', props.class)">
    <slot />
  </button>
  <button v-else class="flex size-12 items-center justify-center rounded-full bg-foreground active:bg-muted-foreground">
    <slot />
  </button>
</template>
