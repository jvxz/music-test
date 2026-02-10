<script lang="ts" setup>
definePageMeta({ layout: 'main' })

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
