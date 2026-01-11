<script setup lang="ts">
import type { ComboboxTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { ComboboxTrigger, useForwardProps } from 'reka-ui'

const props = withDefaults(
  defineProps<ComboboxTriggerProps & { class?: HTMLAttributes['class'], size?: 'sm' | 'default' }>(),
  { size: 'default' },
)

const delegatedProps = reactiveOmit(props, 'class', 'size')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <ComboboxTrigger
    data-slot="combobox-trigger"
    :data-size="size"
    v-bind="forwarded"
    :class="cn(
      interactiveStyles.base,
      interactiveStyles.size.icon,
      props.class,
    )"
  >
    <slot>
      <Icon name="tabler:chevron-down" class="size-3.5! text-muted-foreground" />
    </slot>
  </ComboboxTrigger>
</template>
