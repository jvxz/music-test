<script lang="ts" setup>
const route = useRoute()
const id: number = 'id' in route.params ? Number(route.params.id) : 0

const trackListInput = useTrackListInput()
</script>

<template>
  <div v-if="id">
    <LayoutTrackList
      v-bind="trackListInput"
      type="playlist"
      :path="id.toString()"
    />
  </div>
</template>
