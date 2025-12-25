<script lang="ts" setup>
const route = useRoute()
const path: string = 'path' in route.params ? decodeURIComponent(route.params.path) : ''

const trackListInput = useTrackListInput()
</script>

<template>
  <LayoutTrackList
    v-bind="trackListInput"
    type="folder"
    :path="path"
  />
</template>
