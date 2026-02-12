<script lang="ts" setup>
import type { ImgHTMLAttributes } from 'vue'

type ClassAttributeNames = 'img' | 'noCoverText' | 'root'

const props = defineProps<{
  noCoverText?: string
  classes?: Partial<Record<ClassAttributeNames, string | string[]>>
  img?: ImgHTMLAttributes
}>()

const { currentTrack } = usePlayback()
</script>

<template>
  <div :class="cn('flex size-full items-center justify-center', props.classes?.root)">
    <img
      v-if="currentTrack && currentTrack.tags.APIC"
      v-bind="img"
      :src="currentTrack?.full_uri"
      :class="cn('h-full object-contain', props.classes?.img)"
    />
    <div
      v-else
      :class="cn('grid aspect-square size-full place-items-center text-sm text-muted-foreground', props.classes?.noCoverText)"
    >
      {{ noCoverText ?? 'no cover' }}
    </div>
  </div>
</template>
