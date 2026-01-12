<script lang="ts" setup>
type ClassAttributeNames = 'img' | 'noCoverText' | 'root'

const props = defineProps<{
  noCoverText?: string
  classes?: Partial<Record<ClassAttributeNames, string>>
}>()

const { currentTrack } = usePlayback()
</script>

<template>
  <div :class="cn('flex', props.classes?.root)">
    <img
      v-if="currentTrack && currentTrack.tags.APIC"
      :src="currentTrack?.full_uri"
      :class="cn('h-full', props.classes?.img)"
    />
    <div
      v-else
      :class="cn('grid aspect-square size-full place-items-center font-mono text-sm text-muted-foreground', props.classes?.noCoverText)"
    >
      {{ noCoverText ?? 'no cover' }}
    </div>
  </div>
</template>
