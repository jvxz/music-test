<script lang="ts" setup>
import type { AcceptableValue } from 'reka-ui'

export type DraggableItem<T extends NonNullable<AcceptableValue>> = Prettify<{
  data: T
  label: string
  key: string
}>

defineProps<{
  item: any
}>()
</script>

<template>
  <UButton
    :id="item.key"
    variant="ghost"
    draggable="true"
    class="justify-start gap-2 rounded-none transition-none duration-0 active:text-foreground"
  >
    <Icon name="tabler:grip-vertical" class="size-3.5!" />
    <slot />
  </UButton>
</template>

<style scoped>
@reference '@/assets/css/globals.css';

.sortable-ghost {
  @apply bg-muted text-foreground;
}
</style>
