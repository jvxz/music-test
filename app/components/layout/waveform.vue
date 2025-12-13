<script lang="ts" setup>
const { currentTrack } = usePlayback()
</script>

<template>
  <div class="h-36 w-full border-t">
    <Waveform
      :path="currentTrack?.path"
      class="size-full"
    />
  </div>
</template>
