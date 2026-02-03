<template>
  <LayoutPanelSplitterGroup
    panel-key="right"
    direction="vertical"
  >
    <LayoutPanel
      v-for="(element, idx) in $settings.layout.panel.right.elements"
      :key="element"
      :element="element"
      as-splitter-panel
      :with-resize-handle="idx !== $settings.layout.panel.right.elements.length - 1"
      :default-size="$settings.layout.panel.right.elementSizes[idx]"
    />
  </LayoutPanelSplitterGroup>
</template>
