<script setup lang="ts">
import type { AutocompleteInputEmits, AutocompleteInputProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn, interactiveStyles, staticStyles } from '#imports'
import { AutocompleteInput, useForwardPropsEmits } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AutocompleteInputProps & {
  class?: HTMLAttributes['class']
  showIcon?: boolean
}>(), {
  class: '',
  showIcon: true,
})

const emits = defineEmits<AutocompleteInputEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <div
    data-slot="autocomplete-input-wrapper"
    :class="cn(staticStyles.base, interactiveStyles.size.default, 'flex h-fit w-full items-center gap-2 p-0', props.class)"
  >
    <Icon
      v-if="props.showIcon"
      name="mingcute:search-line"
      class="size-4 shrink-0 opacity-50"
    />
    <AutocompleteInput
      v-no-autocorrect
      data-slot="autocomplete-input"
      :class="cn(
        'flex-1 outline-hidden',
        props.class,
      )"
      v-bind="{ ...$attrs, ...forwarded }"
    >
      <slot />
    </AutocompleteInput>
  </div>
</template>
