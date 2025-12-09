<template>
  <SplitterGroup direction="vertical">
    <SplitterPanel class="flex h-full flex-1 flex-col">
      <LayoutLibrary />
    </SplitterPanel>
    <SplitterResizeHandle />
    <SplitterPanel class="border-t">
      <LayoutPanelCoverArt />
    </SplitterPanel>
  </SplitterGroup>
</template>
