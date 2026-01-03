<script lang="ts" setup>
defineProps<{
  entry: PotentialFileEntry | null
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
