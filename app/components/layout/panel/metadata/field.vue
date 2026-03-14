<script lang="ts" setup>
const { id3Frame, track } = defineProps<{
  id3Frame: Id3FrameId
  track: TrackListEntry | null
}>()

const { isCommittingChanges, isEditable, isEditingMultiple, isValueDirty, proposedChanges, revertChange } = useMetadataStore()!

const isDirty = computed(() => isValueDirty(id3Frame))

const mixedValues = useArrayUnique(() => {
  const values = proposedChanges.value.mixedFrames.get(id3Frame)
  if (!values) {
    const singleValue = proposedChanges.value.frames[id3Frame]?.value
    return singleValue ? [singleValue] : []
  }

  return values.filter(value => value.trim() !== '')
})

const frameType = computed({
  get: () => {
    const targetFrame = proposedChanges.value.frames[id3Frame]
    if (targetFrame?.type === null)
      return false

    else if (targetFrame?.type === 'set' || targetFrame?.type === 'clear')
      return true

    else return false
  },
  set: (value: boolean) => {
    const targetFrame = proposedChanges.value.frames[id3Frame]
    if (targetFrame && targetFrame.type !== null && targetFrame.value)
      value ? (proposedChanges.value.frames[id3Frame] = { ...targetFrame, type: 'clear' }) : revertChange(id3Frame)

    else if (targetFrame && targetFrame.value && targetFrame.type === null)
      value ? (proposedChanges.value.frames[id3Frame] = { ...targetFrame, type: 'set' }) : revertChange(id3Frame)

    else if (!targetFrame) {
      proposedChanges.value.frames[id3Frame] = {
        type: value ? 'clear' : null,
        value: '',
      }
    }

    else if (!targetFrame?.value) {
      switch (targetFrame?.type) {
        case 'clear': {
          revertChange(id3Frame)
          break
        }
        case null: {
          proposedChanges.value.frames[id3Frame] = {
            type: 'clear',
            value: '',
          }
          break
        }
      }
    }
  },
})

const frameValue = computed({
  get: () => proposedChanges.value.frames[id3Frame]?.value ?? '',
  set: (value: string) => {
    const targetFrame = proposedChanges.value.frames[id3Frame]
    if (value && targetFrame && targetFrame.type === 'clear') {
      proposedChanges.value.frames[id3Frame] = {
        type: 'set',
        value,
      }
    }
    else if (value && (!targetFrame || targetFrame?.type === null)) {
      proposedChanges.value.frames[id3Frame] = {
        type: 'set',
        value,
      }
    }
    else if (value && targetFrame) {
      if (targetFrame.value !== value) {
        proposedChanges.value.frames[id3Frame] = {
          type: 'set',
          value,
        }
      }
      else
        revertChange(id3Frame)
    }

    else if (!value) {
      proposedChanges.value.frames[id3Frame] = {
        type: 'clear',
        value: '',
      }
    }
  },
})
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center gap-2">
      <UCheckbox
        v-if="isEditingMultiple"
        :id="id3Frame"
        v-model:model-value="frameType"
        :disabled="!isEditable"
      />
      <ULabel :for="isEditable ? id3Frame : undefined" class="shrink-0 text-sm">
        {{ ID3_MAP[id3Frame] }}
      </ULabel>
      <div class="flex-1" />
      <UButton
        v-if="isDirty"
        :disabled="isCommittingChanges"
        tabindex="-1"
        variant="ghost"
        size="icon"
        class="size-5 shrink-0 text-danger hover:text-danger active:text-danger"
        title="Revert to original value"
        @click.prevent="revertChange(id3Frame)"
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
      <UAutocompleteRoot
        v-if="track && track.valid"
        v-model:model-value="frameValue"
        :disabled="!isEditable"
      >
        <UAutocompleteAnchor>
          <UAutocompleteInput
            :disabled="!isEditable"
            :show-icon="false"
            :placeholder="mixedValues.length > 0 ? 'Mixed...' : undefined"
          />
          <UAutocompleteTrigger
            :disabled="!isEditable"
            tabindex="-1"
            @click.prevent
          />
        </UAutocompleteAnchor>
        <UAutocompleteContent hide-when-empty>
          <UAutocompleteViewport>
            <UAutocompleteGroup>
              <UAutocompleteItem
                v-for="value in mixedValues"
                :key="value"
                :value="value"
              >
                {{ value }}
              </UAutocompleteItem>
            </UAutocompleteGroup>
          </UAutocompleteViewport>
        </UAutocompleteContent>
      </UAutocompleteRoot>
      <UInput v-else disabled />
    </template>
  </div>
</template>
