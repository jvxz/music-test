<script lang="ts" setup>
const { selectedTrack } = useTrackSelection()
</script>

<template>
  <div class="h-36 w-full border-t">
    <Waveform
      :path="selectedTrack?.path"
      class="size-full"
    />
  </div>
</template>
