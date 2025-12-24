<script setup lang="ts">
import type { ContextMenuLabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'

const props = defineProps<ContextMenuLabelProps & { class?: HTMLAttributes['class'], inset?: boolean }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <ContextMenuLabel
    v-bind="delegatedProps"
    :class="
      cn(`cursor-default px-2 py-1 text-xs font-medium text-muted-foreground select-none data-inset:pl-8`, inset && 'pl-8', props.class)"
  >
    <slot />
  </ContextMenuLabel>
</template>
