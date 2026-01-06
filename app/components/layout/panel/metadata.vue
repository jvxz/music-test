<script lang="ts" setup>
const frames: Id3FrameId[] = [
  'TIT2',
  'TPE1',
  'TALB',
  'TPE2',
]

const { currentTrack } = usePlayback()
</script>

<template>
  <div class="flex flex-col *:p-4">
    <div class="flex flex-col gap-2">
      <LayoutPanelMetadataField
        v-for="frame in frames"
        :key="frame"
        :id3-frame="frame"
        :track="currentTrack"
      />
    </div>
  </div>
</template>
