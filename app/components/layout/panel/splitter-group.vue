<script lang="ts" setup>
import type { SplitterGroupProps } from 'reka-ui'

const props = defineProps<{
  panelKey: LayoutPanelKey
  class?: string
} & SplitterGroupProps>()

const { getPanelElements, handlePanelElementsSizeChange } = useLayout()
const panelElements = getPanelElements(props.panelKey)
</script>

<template>
  <SplitterGroup
    v-bind="props"
    :key="panelElements.join('-')"
    :class="cn('flex size-full flex-1', props.class)"
    @layout="(sizes: number[]) => handlePanelElementsSizeChange(panelKey, sizes)"
  >
    <slot />
  </SplitterGroup>
</template>
