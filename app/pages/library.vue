<script lang="ts" setup>
const trackListInput = useTrackListInput()

onMounted(() => {
  trackListInput.value = {
    ...trackListInput.value,
    type: 'library',
  }
})
</script>

<template>
  <LayoutTrackList
    v-bind="trackListInput"
    type="library"
  />
</template>
