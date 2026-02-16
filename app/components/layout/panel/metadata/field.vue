<script lang="ts" setup>
defineProps<{
  id3Frame: Id3FrameId
  track: TrackListEntry | null
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <ULabel class="shrink-0 text-sm">
      {{ ID3_MAP[id3Frame] }}
    </ULabel>
    <template v-if="id3Frame === 'APIC'">
      <CoverArt
        v-if="track"
        :track="$props.track"
        :classes="{
          root: 'rounded w-fit size-48',
          noCoverText: 'border border-dashed border-primary',
        }"
      />
    </template>
    <LayoutPanelMetadataFieldComments
      v-else-if="id3Frame === 'COMM'"
      :track
    />
    <template v-else>
      <UInput
        v-if="track && track.valid"
        :model-value="track.tags[id3Frame]"
        style="text-transform: none"
      />
      <UInput v-else disabled />
    </template>
  </div>
</template>
