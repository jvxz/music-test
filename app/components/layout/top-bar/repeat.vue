<script lang="ts" setup>
const { playbackStatus, setLoop } = usePlayback()
</script>

<template>
  <button @click="setLoop(!playbackStatus?.is_looping)">
    <Icon name="tabler:repeat" class="size-6!" />
  </button>
</template>
