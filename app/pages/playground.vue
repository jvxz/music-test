<script lang="ts" setup>
const { playbackStatus, playTrack, setLoop } = usePlayback()
</script>

<template>
  <div class="flex h-screen flex-col items-center justify-center gap-2">
    <UButton @click="playTrack('')">
      play track
    </UButton>
    <UButton @click="setLoop(true)">
      enable loop
    </UButton>
    <UButton @click="setLoop(false)">
      disable loop
    </UButton>
  </div>
</template>
