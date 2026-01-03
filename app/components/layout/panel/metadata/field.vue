<script lang="ts" setup>
defineProps<{
  id3Frame: Id3FrameId
}>()

const { selectedTrack } = useTrackSelection()
</script>

<template>
  <div class="flex flex-col gap-1">
    <ULabel class="text-sm">
      {{ ID3_MAP[id3Frame] }}
    </ULabel>
    <UInput v-if="selectedTrack?.valid" :model-value="selectedTrack?.tags[id3Frame]" />
    <UInput v-else disabled />
  </div>
</template>
