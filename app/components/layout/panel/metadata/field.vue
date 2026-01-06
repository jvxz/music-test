<script lang="ts" setup>
defineProps<{
  id3Frame: Id3FrameId
  track: TrackListEntry | null
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <ULabel class="text-sm">
      {{ ID3_MAP[id3Frame] }}
    </ULabel>
    <UInput v-if="track && track.valid" :model-value="track.tags[id3Frame]" />
    <UInput v-else disabled />
  </div>
</template>
