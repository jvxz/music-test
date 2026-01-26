<script lang="ts" setup>
const props = defineProps<{
  track: CurrentPlayingTrack | null
  class?: string
}>()
</script>

<template>
  <img
    v-if="track && track.tags.APIC"
    :src="track?.full_uri"
    :class="cn('h-full', props.class)"
  />
  <div
    v-else
    :class="cn('grid size-full place-items-center font-mono text-sm text-muted-foreground', props.class)"
  >
    no cover
  </div>
</template>
