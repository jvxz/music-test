<script lang="ts" setup>
const { currentTrack, playbackStatus, seekCurrentTrack } = usePlayback()

const isChangingPosition = ref(false)
const localPosition = ref([0])

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
      v-model:model-value="localPosition"
      :max="playbackStatus?.duration ?? 0"
      class="relative flex max-h-2 w-full grow bg-muted"
      :step="0.01"
    >
      <SliderTrack
        class="relative h-2 grow overflow-hidden"
        @pointerdown="handlePointer('down')"
        @pointerup="handlePointer('up')"
      >
        <SliderRange class="absolute h-2 bg-primary/25" />
      </SliderTrack>
      <SliderThumb
        class="absolute top-1/2 h-2 w-4 -translate-y-1/2 bg-primary outline-none focus-visible:ring-0"
        @pointerdown="handlePointer('down')"
        @pointerup="handlePointer('up')"
      />
    </SliderRoot>
  </div>
</template>
