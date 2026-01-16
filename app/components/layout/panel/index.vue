<script lang="ts" setup>
import type { SplitterPanelEmits, SplitterPanelProps } from 'reka-ui'
import { useForwardPropsEmits } from 'reka-ui'

const props = defineProps<{
  element: LayoutElementKey
  asSplitterPanel?: boolean
} & SplitterPanelProps>()

const emits = defineEmits<SplitterPanelEmits>()
const forwarded = useForwardPropsEmits(props, emits)

const [DefinePanels, ReusePanels] = createReusableTemplate()
</script>

<template>
  <DefinePanels>
    <LayoutPanelCoverArt v-if="element === 'cover-art'" />
    <LayoutPanelMetadata v-if="element === 'metadata-view'" />
    <LayoutPanelLibrary v-if="element === 'library-view'" />
  </DefinePanels>

  <template v-if="asSplitterPanel">
    <SplitterPanel
      v-bind="forwarded"
      class="flex h-full flex-1 flex-col"
    >
      <ReusePanels />
    </SplitterPanel>
  </template>
  <template v-else>
    <ReusePanels />
  </template>
</template>
