<script lang="ts" setup>
const { currentTrack, playbackStatus } = usePlayback()
// const { now, pause, resume } = useNow({ controls: true, interval: 100 })


</script>

<template>
  <div class="flex grow -translate-y-2 flex-col items-center gap-1 *:shrink-0">
    <div class="flex h-9 flex-col text-center">
      <p class="truncate text-sm">
        {{ currentTrack?.name }}
      </p>
      <p class="text-xs text-muted-foreground">
        {{ currentTrack?.tags.TPE1 }}
      </p>
    </div>
    <SliderRoot
      class="relative flex max-h-2 w-full grow bg-muted"
      :model-value="[playbackStatus?.position ?? 0]"
      :max="playbackStatus?.duration ?? 0"
      :step="0.01"
    >
      <SliderTrack class="relative h-2 grow overflow-hidden">
        <SliderRange class="absolute h-2 bg-primary/25" />
      </SliderTrack>
      <SliderThumb class="absolute top-1/2 h-2 w-4 -translate-y-1/2 bg-primary outline-none focus-visible:ring-0" />
    </SliderRoot>
  </div>
</template>
