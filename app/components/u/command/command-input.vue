<script setup lang="ts">
import type { ListboxFilterProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { useForwardProps } from 'reka-ui'
import { useCommand } from '.'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<ListboxFilterProps & {
  class?: HTMLAttributes['class']
  icon?: string
  placeholder?: string
}>()

const modelValue = defineModel<string>({
  default: '',
})

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)

const { filterState } = useCommand()

const searchRef = toRef(filterState, 'search')
syncRef(modelValue, searchRef)
</script>

<template>
  <div class="flex h-12 shrink-0 items-center gap-2 px-4" cmdk-input-wrapper>
    <Icon
      v-if="props.icon"
      :name="props.icon"
      class="size-4 shrink-0 opacity-50"
    />

    <ListboxFilter
      v-bind="{ ...forwardedProps, ...$attrs }"
      v-model="filterState.search"
      v-no-autocorrect
      data-slot="command-input"
      auto-focus
      :class="cn('flex w-full text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50', props.class)"
    />
  </div>
</template>
