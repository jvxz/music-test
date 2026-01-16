<script lang="ts" setup>
const props = defineProps<{
  class?: string
}>()
const { playbackStatus, setVolume, toggleMute } = usePlayback()

function handleScroll(event: WheelEvent) {
  if (event.deltaY > 0) {
    setVolume(playbackStatus.value?.volume ?? 0 - 1)
  }
  else {
    setVolume(playbackStatus.value?.volume ?? 0 + 1)
  }
}
</script>

<template>
  <div :class="cn('flex -translate-y-[3px] items-center gap-2', props.class)">
    <button class="size-5" @click="toggleMute()">
      <Icon :name="playbackStatus?.is_muted ? 'mdi:volume-mute' : 'mdi:volume-source'" class="size-5!" />
    </button>
    <SliderRoot
      :model-value="[playbackStatus?.volume ?? 0]"
      class="relative h-4 w-24"
      :max="0"
      :step="0.01"
      :min="-60"
      @update:model-value="setVolume($event?.[0]!)"
      @wheel.prevent="handleScroll"
    >
      <SliderTrack class="absolute top-1/2 h-0.5 w-full -translate-y-1/2 bg-muted">
        <SliderRange class="absolute top-1/2 h-0.5 -translate-y-1/2 bg-primary" />
      </SliderTrack>
      <SliderThumb class="absolute top-1/2 h-3 w-1 -translate-y-1/2 bg-foreground outline-none focus-visible:ring-0" />
    </SliderRoot>
  </div>
</template>
