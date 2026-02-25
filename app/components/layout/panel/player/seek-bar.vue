<script lang="ts" setup>
type ClassAttributeOptions = 'container' | 'thumb'

withDefaults(defineProps<{
  classes?: Partial<Record<ClassAttributeOptions, string>>
  showDuration?: 'top-right' | 'top-left' | 'both-sides' | false
}>(), {
  showDuration: 'both-sides',
})

const { playbackStatus, seekCurrentTrack } = usePlayback()

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
  else
    isChangingPosition.value = true
}

const computedDuration = computed(() => formatDuration(playbackStatus.value?.duration ?? 0, 's'))
const computedPosition = computed(() => formatDuration(playbackStatus.value?.position ?? 0, 's'))
</script>

<template>
  <div :class="cn('relative flex w-[45%] grow -translate-y-3 flex-col items-center gap-1 *:shrink-0', classes?.container)">
    <p
      v-if="showDuration && ['top-right', 'top-left'].includes(showDuration)"
      :class="cn('absolute right-0 bottom-0 text-xs text-muted-foreground', showDuration === 'top-right' ? 'right-0' : 'left-0')"
    >
      {{ computedPosition }} / {{ computedDuration }}
    </p>
    <div class="flex w-full items-center gap-4">
      <p v-if="showDuration === 'both-sides'" class="text-xs text-muted-foreground">
        {{ computedPosition }}
      </p>
      <SliderRoot
        :key="playbackStatus?.position"
        v-model:model-value="localPosition"
        :max="playbackStatus?.duration ?? 0"
        class="relative flex h-4 w-full grow"
        :step="0.01"
        @pointerdown="handlePointer('down')"
        @pointerup="handlePointer('up')"
      >
        <SliderTrack class="absolute top-1/2 h-2 w-full grow -translate-y-1/2 bg-muted">
          <SliderRange class="absolute top-1/2 h-2 -translate-y-1/2 bg-primary/25" />
        </SliderTrack>
        <SliderThumb
          :class="cn('absolute top-1/2 h-2 w-4 -translate-y-1/2 bg-primary outline-none focus-visible:ring-0', classes?.thumb)"
          @pointerdown="handlePointer('down')"
          @pointerup="handlePointer('up')"
        />
      </SliderRoot>
      <p v-if="showDuration === 'both-sides'" class="text-xs text-muted-foreground">
        {{ computedDuration }}
      </p>
    </div>
  </div>
</template>
