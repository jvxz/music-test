<script lang="ts" setup>
import { useDraggable } from 'vue-draggable-plus'

const { elementDraggingData } = useLayout()

const listEl = shallowRef<HTMLDivElement | null>(null)
const { isOutside: isOutsideList } = useMouseInElement(listEl)

const list = shallowRef([...layoutPanelElementKeys])
const initialList = list.value

useDraggable(listEl, list, {
  animation: 0,
  direction: 'vertical',
  fallbackOnBody: true,
  forceFallback: true,
  ghostClass: 'sortable-ghost-item',
  group: {
    name: 'layout-elements',
    pull: 'clone',
  },
  onEnd: () => {
    list.value = initialList
    elementDraggingData.value = null
  },
  onStart: evt => elementDraggingData.value = { element: evt.data, from: 'AVAILABLE_ELEMENTS' },
  selectedClass: 'bg-blue-500',
  sort: false,
})

useStyleTag(computed(() => elementDraggingData.value && elementDraggingData.value.from !== 'AVAILABLE_ELEMENTS'
  ? `
  .sortable-ghost-item {
    display: none !important;
  }
`
  : ''))
</script>

<template>
  <div class="relative -m-1 flex h-fit w-1/4 flex-col gap-1 p-2">
    <ULabel
      class="font-medium"
      :class="{
        'opacity-30': elementDraggingData && elementDraggingData.from !== 'AVAILABLE_ELEMENTS',
      }"
    >
      Available elements
    </ULabel>
    <div
      ref="listEl"
      class="flex h-fit shrink-0 flex-col gap-1 rounded py-1"
      :class="{
        'opacity-25': elementDraggingData && elementDraggingData.from !== 'AVAILABLE_ELEMENTS',
      }"
    >
      <UButton
        v-for="element in layoutPanelElements"
        :id="element.key"
        :key="element.key"
        variant="ghost"
        draggable="true"

        class="justify-start rounded-r-none transition-none duration-0 active:bg-inherit active:text-muted-foreground"
      >
        <Icon name="tabler:grip-vertical" class="size-3.5!" />
        <p>{{ element.label }}</p>
      </UButton>
    </div>
    <div
      v-if="elementDraggingData && elementDraggingData.from !== 'AVAILABLE_ELEMENTS'"
      class="pointer-events-none absolute inset-0 flex size-full items-center justify-center rounded font-medium"
      :class="!isOutsideList && 'bg-muted/40'"
    >
      Drop to delete
    </div>
  </div>
</template>
