<script setup lang="ts">
import type { DropdownMenuRadioItemEmits, DropdownMenuRadioItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { useForwardPropsEmits } from 'reka-ui'

const props = defineProps<DropdownMenuRadioItemProps & { class?: HTMLAttributes['class'] }>()

const emits = defineEmits<DropdownMenuRadioItemEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DropdownMenuRadioItem
    v-bind="forwarded"
    :class="cn(
      popoverStyles.item,
      props.class,
    )"
  >
    <span class="pointer-events-none absolute left-2 flex h-full items-center justify-center">
      <DropdownMenuItemIndicator>
        <Icon name="tabler:circle-filled" class="size-2.5! fill-current" />
      </DropdownMenuItemIndicator>
    </span>
    <span class="ps-4.5"><slot /></span>
  </DropdownMenuRadioItem>
</template>
