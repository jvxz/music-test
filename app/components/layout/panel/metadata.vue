<script lang="ts" setup>
const x: Id3FrameId[] = [
  'TIT2',
  'TPE1',
  'TALB',
  'TPE2',
]
</script>

<template>
  <div class="flex flex-col *:p-4">
    <div class="flex flex-col gap-2">
      <LayoutPanelMetadataField
        v-for="frame in x"
        :key="frame"
        :id3-frame="frame"
      />
    </div>
  </div>
</template>
