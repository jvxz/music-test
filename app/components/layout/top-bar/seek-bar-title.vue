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
</script>

<template>
  <UContextMenu>
    <UContextMenuTrigger as-child>
      <div
        class="flex h-9 cursor-default flex-col text-center"
        draggable="true"
        @dragstart.prevent="handleDragStart"
      >
        <p class="truncate text-sm">
          {{ currentTrack?.tags.TIT2 ?? currentTrack?.name }}
        </p>
        <p class="relative w-full text-xs text-muted-foreground">
          {{ currentTrack?.tags.TPE1 }}
        </p>
      </div>
    </UContextMenuTrigger>
    <TrackListEntryContextMenuContent v-if="currentTrack" :entries="[currentTrack]" />
  </UContextMenu>
</template>
