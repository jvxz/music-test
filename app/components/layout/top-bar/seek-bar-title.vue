<script lang="ts" setup>
defineProps<{
  currentTrack: CurrentPlayingTrack | null
}>()
</script>

<template>
  <UContextMenu>
    <UContextMenuTrigger as-child>
      <div class="flex h-9 cursor-default flex-col text-center">
        <p class="truncate text-sm">
          {{ currentTrack?.tags.TIT2 ?? currentTrack?.name }}
        </p>
        <p class="relative w-full text-xs text-muted-foreground">
          {{ currentTrack?.tags.TPE1 }}
        </p>
      </div>
    </UContextMenuTrigger>
    <TrackListEntryContextMenuContent v-if="currentTrack" :entry="currentTrack" />
  </UContextMenu>
</template>
