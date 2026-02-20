<script lang="ts" setup>
const { id3Frame, track } = defineProps<{
  id3Frame: Id3FrameId
  track: TrackListEntry | null
}>()

const { isValueDirty, proposedChanges, revertChange } = useMetadata(() => track, 'panel')

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
    <!-- <template v-else-if="['TYER'].includes(id3Frame)">
      <UNumberFieldRoot>
        <UNumberFieldInput
          v-if="track && track.valid"
          v-model:model-value="proposedChanges[id3Frame]"
          v-no-autocorrect
          type="number"
          style="text-transform: none"
        />
      </UNumberFieldRoot>
      <UInput
        v-if="track && track.valid"
        v-model:model-value="proposedChanges[id3Frame]"
        v-no-autocorrect
        type="number"
        style="text-transform: none"
      />
    </template> -->
    <template v-else>
      <UInput
        v-if="track && track.valid"
        v-model:model-value="proposedChanges[id3Frame]"
        v-no-autocorrect
        style="text-transform: none"
      />
      <UInput v-else disabled />
    </template>
  </div>
</template>
