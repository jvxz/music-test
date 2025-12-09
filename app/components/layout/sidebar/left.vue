<script lang="ts" setup>
const { layoutPanels } = usePersistentPanels('left', [75, 25])
</script>

<template>
  <SplitterGroup
    direction="vertical"
    @layout="layoutPanels = $event"
  >
    <SplitterPanel
      :default-size="layoutPanels[0]"
      class="flex h-full flex-1 flex-col"
    >
      <LayoutLibrary />
    </SplitterPanel>
    <SplitterResizeHandle />
    <SplitterPanel
      :default-size="layoutPanels[1]"
      class="border-t"
    >
      <LayoutPanelCoverArt />
    </SplitterPanel>
  </SplitterGroup>
</template>
