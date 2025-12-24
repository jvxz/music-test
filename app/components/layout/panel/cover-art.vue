<script lang="ts" setup>
const { currentTrack } = usePlayback()
</script>

<template>
  <div class="grid size-full place-items-center">
    <img
      v-if="currentTrack?.path"
      :data-cover-missing="!currentTrack?.tags.APIC ? '' : undefined"
      :src="currentTrack?.full_uri"
      class="h-full w-full object-contain data-cover-missing:scale-75 data-cover-missing:opacity-80 dark:data-cover-missing:invert"
    />
  </div>
</template>
