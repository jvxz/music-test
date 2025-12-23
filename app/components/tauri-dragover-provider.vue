<script lang="ts" setup>
import { Slot as RekaSlot } from 'reka-ui'
import { computed } from 'vue'

const emits = defineEmits<{
  drop: [itemPaths: string[]]
  over: []
  leave: []
}>()

const { $dragHandler } = useNuxtApp()

const elRef = shallowRef<HTMLElement | null>(null)

const isOver = computed(() => {
  if (!$dragHandler.isDragging.value)
    return false

  return checkMatch()
})

watch(isOver, () => {
  if (isOver.value) {
    emits('over')
  }
  else {
    emits('leave')
  }
})

watch($dragHandler.droppedItemPaths, () => {
  if (checkMatch()) {
    emits('drop', $dragHandler.droppedItemPaths.value)
  }
})

function checkMatch() {
  const target = $dragHandler.overElement.value
  const container = unrefElement(elRef)

  if (!target || !container)
    return false

  return container === target || container.contains(target)
}
</script>

<template>
  <div
    ref="elRef"
    class="contents"
    v-bind="$attrs"
  >
    <RekaSlot :data-drag-over="isOver ? '' : undefined">
      <slot :is-over />
    </RekaSlot>
  </div>
</template>
