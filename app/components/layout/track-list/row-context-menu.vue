<script lang="ts" setup>
defineProps<{
  entry: TrackListEntry | null
}>()
</script>

<template>
  <UContextMenu>
    <UContextMenuTrigger as-child>
      <slot />
    </UContextMenuTrigger>
    <TrackListEntryContextMenuContent v-if="entry" :entry />
  </UContextMenu>
</template>
