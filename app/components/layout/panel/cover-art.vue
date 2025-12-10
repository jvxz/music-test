<script lang="ts" setup>
const { selectedTrack } = useTrackSelection()
</script>

<template>
  <div class="grid size-full place-items-center">
    <img
      v-if="selectedTrack?.path"
      :data-cover-missing="!selectedTrack?.tags.APIC ? '' : undefined"
      :src="selectedTrack?.full_uri"
      class="h-full w-full object-contain data-cover-missing:scale-75 data-cover-missing:opacity-80 dark:data-cover-missing:invert"
    />
  </div>
</template>
