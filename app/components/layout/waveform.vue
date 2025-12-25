<script lang="ts" setup>
const { currentTrack } = usePlayback()
</script>

<template>
  <div class="h-36 w-full border-t shrink-0">
    <Waveform
      :path="currentTrack?.path"
      class="size-full"
    />
  </div>
</template>
