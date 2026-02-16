<script lang="ts" setup>
const { currentTrack } = usePlayback()
</script>

<template>
  <LayoutPanelLayout>
    <LayoutPanelMetadataField
      v-for="frame in $settings.layout.element.metadataView.frames"
      :key="frame"
      :id3-frame="frame"
      :track="currentTrack"
    />
  </LayoutPanelLayout>
</template>
