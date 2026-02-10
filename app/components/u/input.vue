<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
  leadingIcon?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: true,
})
</script>

<template>
  <div v-if="props.leadingIcon" class="relative shrink-0">
    <Icon :name="props.leadingIcon" class="absolute inset-0 top-1/2 left-1.5 shrink-0 -translate-y-1/2 scale-80 opacity-50" />
    <input
      v-bind="$attrs"
      v-model="modelValue"
      data-1p-ignore
      :class="cn(
        staticStyles.base,
        interactiveStyles.size.default,
        staticStyles.variant.default,
        'flex w-full min-w-0 cursor-text truncate py-1 font-sans selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:text-foreground placeholder:text-muted-foreground focus-visible:ring-0 md:text-sm',
        'ps-6',
        props.class,
      )"
    >
  </div>
  <input
    v-else
    v-bind="$attrs"
    v-model="modelValue"
    data-1p-ignore
    :class="cn(staticStyles.base, interactiveStyles.size.default, staticStyles.variant.default, 'flex w-full min-w-0 cursor-text truncate py-1 font-sans font-medium selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:text-foreground placeholder:text-muted-foreground focus-visible:ring-0 md:text-sm', props.class)"
  >
</template>
