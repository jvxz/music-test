<script lang="ts" setup>
defineProps<{
  track: TrackListEntry | null
}>()
const settings = useSettings()

const height = shallowRef(settings.layout.element.metadataView.frameCommHeight)

const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const { height: elHeight } = useElementSize(textarea)
watchDebounced(elHeight, height => settings.layout.element.metadataView.frameCommHeight = height, { debounce: 200 })

const { proposedChanges } = useMetadata()
</script>

<template>
  <UTextarea
    v-if="track && track.valid"
    ref="textarea"
    v-no-autocorrect
    v-model:model-value="proposedChanges.COMM"
    style="text-transform: none"
    :style="{ height: `${height}px` }"
    class="max-h-96 min-h-16 resize-y"
  />
  <UTextarea
    v-else
    ref="textarea"
    disabled
    style="text-transform: none"
    :style="{ height: `${height}px` }"
    class="max-h-96 min-h-16 resize-y"
  />
</template>
