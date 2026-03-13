<script lang="ts" setup>
const { id3Frame, track } = defineProps<{
  id3Frame: Id3FrameId
  track: TrackListEntry | null
}>()

const { isCommittingChanges, isValueDirty, proposedChanges, revertChange } = useMetadataStore()!

const isDirty = computed(() => isValueDirty(id3Frame))
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <ULabel class="shrink-0 text-sm">
        {{ ID3_MAP[id3Frame] }}
      </ULabel>
      <UButton
        v-if="isDirty"
        :disabled="isCommittingChanges"
        tabindex="-1"
        variant="ghost"
        size="icon"
        class="size-5 shrink-0 text-danger hover:text-danger active:text-danger"
        title="Revert to original value"
        @click="revertChange(id3Frame)"
      >
        <Icon name="tabler:arrow-back-up" />
      </UButton>
    </div>
    <template v-if="id3Frame === 'APIC'">
      <CoverArt
        v-if="track"
        :track="$props.track"
        :classes="{
          root: 'rounded w-full',
          noCoverText: 'border border-dashed border-primary',
          img: 'w-full',
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
        v-model:model-value="proposedChanges.frames[id3Frame]"
        v-no-autocorrect
        :placeholder="proposedChanges.mixedFrames.has(id3Frame) ? 'Mixed...' : undefined"
        style="text-transform: none"
        @keydown.meta.enter.prevent
      />
      <UInput v-else disabled />
    </template>
  </div>
</template>
