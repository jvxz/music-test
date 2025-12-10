<script lang="ts" setup>
const {selectedTrack} = useTrackSelection()
</script>

<template>
  <div class="flex h-32 items-center gap-32 border-b px-16 *:h-8 *:shrink-0">
    <div class="flex items-center gap-2 *:active:text-muted-foreground">
      <button class="">
        <Icon name="tabler:player-skip-back-filled" class="size-6!" />
      </button>
      <button><Icon name="tabler:player-play-filled" class="size-8!" /></button>
      <button><Icon name="tabler:player-skip-forward-filled" class="size-6!" /></button>
    </div>
    <div class="flex items-center gap-2 -translate-y-[3px]">
      <Icon name="mdi:volume-source" class="size-5!" />
      <SliderRoot class="relative h-[2px] w-24 bg-muted-foreground/50">
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb class="absolute top-1/2 h-3 w-1 -translate-y-1/2 bg-foreground outline-none focus-visible:ring-0" />
      </SliderRoot>
    </div>
    <div class="flex grow flex-col items-center *:shrink-0 gap-1 -translate-y-2">
      <div class="flex flex-col h-9 text-center">
        <p class="text-sm truncate">{{ selectedTrack?.tags.TIT2 ?? selectedTrack?.name }}</p>
        <p class="text-xs text-muted-foreground">{{ selectedTrack?.tags.TPE1 }}</p>
      </div>
      <SliderRoot class="relative flex max-h-2 w-full grow bg-muted">
        <SliderTrack class="relative h-2 grow overflow-hidden">
          <SliderRange class="absolute h-2 bg-primary/25" />
        </SliderTrack>
        <SliderThumb class="absolute top-1/2 h-2 w-4 -translate-y-1/2 bg-primary outline-none focus-visible:ring-0" />
      </SliderRoot>
    </div>
    <div class="w-86.75"></div>
  </div>
</template>
