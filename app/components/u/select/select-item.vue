<script setup lang="ts">
import type { SelectItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { useForwardProps } from 'reka-ui'

const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectItem
    data-slot="select-item"
    v-bind="forwardedProps"
    :class="cn(
      popoverStyles.item,
      'relative flex w-full cursor-default items-center gap-2 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
      props.class,
    )"
  >
    <span class="absolute right-2 top-1/2 -translate-y-1/2">
      <SelectItemIndicator>
        <slot name="indicator-icon">
          <Icon name="tabler:check" class="" />
        </slot>
      </SelectItemIndicator>
    </span>

    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
