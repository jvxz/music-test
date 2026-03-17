<script lang="ts" setup>
const { currentTrack } = usePlayback()
</script>

<template>
  <div class="border-t shrink-0 h-36 w-full">
    <Waveform
      :path="currentTrack?.path"
      class="size-full"
    />
  </div>
</template>
