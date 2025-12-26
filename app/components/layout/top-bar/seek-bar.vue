<script lang="ts" setup>
const { currentTrack, playbackStatus, seekCurrentTrack } = usePlayback()

const isChangingPosition = ref(false)
const localPosition = ref([playbackStatus.value?.position ?? 0])

watch(() => playbackStatus.value?.position, () => {
  if (isChangingPosition.value || !playbackStatus.value || playbackStatus.value.position === undefined)
    return

  localPosition.value = [playbackStatus.value.position]
})

function handlePointer(type: 'up' | 'down') {
  if (type === 'up') {
    isChangingPosition.value = false

    const [to] = localPosition.value
    if (to === undefined)
      return

    seekCurrentTrack(to)
  }
  else {
    isChangingPosition.value = true
  }
}
</script>

<template>
  <div class="flex w-[45%] grow -translate-y-3 flex-col items-center gap-1 *:shrink-0">
    <div class="flex h-9 flex-col text-center">
      <p class="truncate text-sm">
        {{ currentTrack?.tags.TIT2 ?? currentTrack?.name }}
      </p>
      <p class="relative w-full text-xs text-muted-foreground">
        {{ currentTrack?.tags.TPE1 }}
      </p>
    </div>
    <SliderRoot
      v-model:model-value="localPosition"
      :max="playbackStatus?.duration ?? 0"
      class="relative flex h-4 w-full grow"
      :step="0.01"
      @pointerdown="handlePointer('down')"
      @pointerup="handlePointer('up')"
    >
      <SliderTrack
        class="absolute top-1/2 h-2 w-full grow -translate-y-1/2 bg-muted"
      >
        <SliderRange
          class="absolute top-1/2 h-2 -translate-y-1/2 bg-primary/25"
        />
      </SliderTrack>
      <SliderThumb
        class="absolute top-1/2 h-2 w-4 -translate-y-1/2 bg-primary outline-none focus-visible:ring-0"
        @pointerdown="handlePointer('down')"
        @pointerup="handlePointer('up')"
      />
    </SliderRoot>
  </div>
</template>
