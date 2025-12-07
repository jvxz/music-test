<script lang="ts" setup>
const { selectedTrack } = useTrackSelection()
</script>

<template>
  <div class="grid size-full place-items-center">
    <img
      v-if="selectedTrack?.path"
      :data-cover-missing="!selectedTrack?.tags.APIC ? '' : undefined"
      :src="buildCoverUri(selectedTrack?.path, 'full')"
      class="h-full w-full object-contain data-cover-missing:opacity-80 dark:data-cover-missing:invert data-cover-missing:scale-75"
    />
  </div>
</template>
