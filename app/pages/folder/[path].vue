<script lang="ts" setup>
const route = useRoute()
const path: string = 'path' in route.params ? decodeURIComponent(route.params.path) : ''
</script>

<template>
  <LayoutTrackList
    type="folder"
    :path="path"
  />
</template>
