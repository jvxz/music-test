<template>
  <LayoutPanelSplitterGroup
    panel-key="left"
    direction="vertical"
  >
    <LayoutPanel
      v-for="(element, idx) in $settings.layout.panel.left.elements"
      :key="element"
      :element="element"
      as-splitter-panel
      :with-resize-handle="idx !== $settings.layout.panel.left.elements.length - 1"
      :default-size="$settings.layout.panel.left.elementSizes[idx]"
    />
  </LayoutPanelSplitterGroup>
</template>
