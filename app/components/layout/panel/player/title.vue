<script lang="ts" setup>
const props = defineProps<{
  currentTrack: CurrentPlayingTrack | null
}>()

const { startDrag } = useDrag()

async function handleDragStart() {
  if (!props.currentTrack)
    return

  await startDrag({
    data: {
      entries: [props.currentTrack],
    },
    key: 'track-list-entry',
  }, {
    item: [props.currentTrack.path],
  })
}

const { getElementSettings } = useLayout()
const elementSettings = getElementSettings('player')

const [DefineMarquee, ReuseMarquee] = createReusableTemplate()
</script>

<template>
  <DefineMarquee v-slot="{ $slots }">
    <UMarquee
      v-if="elementSettings.marqueeText"
      :key="currentTrack?.tags.TIT2 ?? currentTrack?.name"
      :title="currentTrack?.tags.TIT2 ?? currentTrack?.name"
      :animate-on-overflow-only="true"
      :delay="2"
      gap="0.5rem"
      :pause-on-hover="true"
      class="w-fit! max-w-2xl"
    >
      <component :is="$slots.default" />
    </UMarquee>
    <component :is="$slots.default" v-else />
  </DefineMarquee>

  <div
    :data-position="elementSettings.titlePosition"
    class="group flex cursor-default flex-col data-[position=center]:h-9 data-[position=center]:items-center"
    draggable="true"
    @dragstart.prevent="handleDragStart"
  >
    <ReuseMarquee>
      <p
        :title="currentTrack?.tags.TIT2 ?? currentTrack?.name"
        class="truncate font-medium group-data-[position=center]:text-sm"
        :class="{
          'max-w-2xl': !elementSettings.marqueeText,
        }"
      >
        {{ currentTrack?.tags.TIT2 ?? currentTrack?.name }}
      </p>
    </ReuseMarquee>
    <ReuseMarquee>
      <p
        :title="currentTrack?.tags.TPE1"
        class="truncate text-sm text-muted-foreground group-data-[position=center]:text-xs"
        :class="{
          'max-w-2xl': !elementSettings.marqueeText,
        }"
      >
        {{ currentTrack?.tags.TPE1 }}
      </p>
    </ReuseMarquee>
  </div>
</template>
