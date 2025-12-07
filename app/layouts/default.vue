<script lang="ts" setup>
const { layoutPanels } = useLayoutPanels()
</script>

<template>
  <div class="flex h-screen flex-col">
    <SplitterGroup
      direction="horizontal"
      class="flex size-full flex-1"
      @layout="layoutPanels = $event"
    >
      <SplitterPanel
        :max-size="35"
        :min-size="12.5"
        class="flex shrink-0 flex-col border-r"
        :default-size="layoutPanels[0]"
      >
        <LayoutSidebarLeft />
      </SplitterPanel>
      <SplitterResizeHandle />
      <SplitterPanel class="flex-1">
        <slot />
      </SplitterPanel>
      <SplitterResizeHandle />
      <SplitterPanel
        :max-size="35"
        :min-size="12.5"
        :default-size="layoutPanels[2]"
        class="shrink-0 border-l"
      >
        <LayoutSidebarRight />
      </SplitterPanel>
    </SplitterGroup>
  </div>
</template>
