<script lang="ts" setup>
const elements = [
  {
    key: 'cover-art',
    label: 'Cover art',
  },
  {
    key: 'library',
    label: 'Library view',
  },
]

const { startDrag } = useDrag()
</script>

<template>
  <div class="flex h-full w-1/3 flex-col gap-px">
    <UButton
      v-for="element in elements"
      :key="element.key"
      variant="ghost"
      class="justify-start"
      draggable="true"
      @dragstart="startDrag({
        key: 'layout-element',
        data: {
          elementKey: element.key,
        },
      }, {
        item: {
          data: element.key,
          types: ['public.plain-text'],
        },
      })"
    >
      <Icon name="tabler:grip-vertical" class="size-3.5!" />
      <p>{{ element.label }}</p>
    </UButton>
  </div>
</template>
