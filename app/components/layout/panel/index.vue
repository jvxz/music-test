<script lang="ts" setup>
import type { SplitterPanelEmits, SplitterPanelProps } from 'reka-ui'
import { useForwardPropsEmits } from 'reka-ui'

const props = withDefaults(defineProps<{
  element: LayoutElementKey
  asSplitterPanel?: boolean
  withResizeHandle?: boolean
} & SplitterPanelProps>(), {
  asSplitterPanel: true,
})

const emits = defineEmits<SplitterPanelEmits>()
const forwarded = useForwardPropsEmits(props, emits)

const [DefinePanels, ReusePanels] = createReusableTemplate()
</script>

<template>
  <DefinePanels>
    <LayoutPanelPlayer v-if="element === 'player'" />
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
    <SplitterResizeHandle v-if="withResizeHandle" class="bg-border data-[orientation=horizontal]:h-full data-[orientation=horizontal]:w-px data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full" />
  </template>
  <template v-else>
    <ReusePanels />
  </template>
</template>
