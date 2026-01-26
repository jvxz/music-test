<script lang="ts" setup>
const props = defineProps<{
  panel: LayoutPanel
}>()

const containerEl = shallowRef<HTMLDivElement | null>(null)
const { isOutside: isOutsideContainer } = useMouseInElement(containerEl)

const { elementDraggingData, isElementAllowedInPanel } = useLayout()

const containerHoverClass = computed(() => {
  if (!elementDraggingData.value)
    return ''

  if (!isElementAllowedInPanel(props.panel.key, elementDraggingData.value.element) && elementDraggingData.value.from !== props.panel.key)
    return 'opacity-50'

  if (!isOutsideContainer.value)
    return 'bg-muted/40'

  return ''
})
</script>

<template>
  <div
    ref="containerEl"
    class="group -m-2 flex items-start gap-2 overflow-hidden rounded p-2"
    :class="containerHoverClass"
  >
    <div class="flex shrink-0 flex-col gap-2">
      <div class="flex aspect-video w-24 rounded border">
        <div :class="panel.class" />
      </div>
    </div>
    <div class="flex w-2/5 flex-col gap-2">
      <div class="flex items-center gap-2">
        <ULabel>
          {{ panel.label }}
        </ULabel>
      </div>
      <div class="flex flex-col gap-1">
        <ModalSettingsContentLayoutPanelsElements :panel-key="panel.key" />
      </div>
    </div>
  </div>
</template>
