<script lang="ts" setup>
const trackListInput = useTrackListInput()
</script>

<template>
  <LayoutTrackList
    v-bind="trackListInput"
    type="library"
  />
</template>
