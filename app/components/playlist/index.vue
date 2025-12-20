<script lang="ts" setup>
defineProps<{
  type: 'folder' | 'playlist'
  path: string
}>()
</script>

<template>
  <LayoutPlaylist
    :type="type"
    :path="path"
  />
</template>
