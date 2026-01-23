<script lang="ts" setup>
import { VueDraggable } from 'vue-draggable-plus'

const props = defineProps<{
  panelKey: LayoutPanelKey
}>()

const { elementDraggingData, elementSettingsToShow, getPanelElements, isElementAllowedInPanel, removeElementFromPanel } = useLayout()
const panelElements = getPanelElements(props.panelKey)
</script>

<template>
  <VueDraggable
    id="panel-elements"
    :key="panelElements.join(',')"
    v-model="panelElements"
    :animation="100"
    direction="vertical"
    fallback-class="opacity-25"
    :fallback-on-body="true"
    :force-fallback="true"
    :group="{
      name: 'layout-elements',
      pull: true,
      put: (_to, _from, dragEl) => {
        const newElement = dragEl.id as LayoutElementKey

        return isElementAllowedInPanel(props.panelKey, newElement)
      },
    }"
    selected-class="bg-blue-500"
    class="relative flex flex-col gap-1 empty:before:absolute empty:before:inset-0 empty:before:text-sm empty:before:text-muted-foreground empty:before:content-['(hidden,_no_elements_contained)']"
    @end="(evt) => {
      if (evt.from !== evt.to) {
        removeElementFromPanel(props.panelKey, evt.data)
      }
      elementDraggingData = null
    }"
    @start="evt => elementDraggingData = { element: evt.data, from: props.panelKey }"
  >
    <UContextMenu
      v-for="element in panelElements"
      :key="element"
    >
      <UContextMenuTrigger as-child>
        <div
          :id="element"
          class="flex items-center w-fit"
        >
          <UButton
            variant="ghost"
            class="justify-start transition-none duration-0 active:bg-inherit active:text-muted-foreground rounded-r-none"
          >
            <Icon name="tabler:grip-vertical" class="size-3.5!" />
            <p>{{ sentenceCase(element) }}</p>
          </UButton>
          <UButton @click="elementSettingsToShow = element" variant="ghost" size="icon" class="transition-none duration-0 rounded-l-none">
            <Icon name="tabler:pencil" class="size-3.5!" />
          </UButton>
        </div>
      </UContextMenuTrigger>
      <UContextMenuContent>
        <UContextMenuItem @click="removeElementFromPanel(props.panelKey, element)">
          Remove
        </UContextMenuItem>
        <UContextMenuItem @click="elementSettingsToShow = element">
          Edit
        </UContextMenuItem>
      </UContextMenuContent>
    </UContextMenu>
  </VueDraggable>
</template>
