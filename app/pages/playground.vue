<script setup>
import { ref } from 'vue'
import { useDraggable } from 'vue-draggable-plus'

definePageMeta({
  layout: false,
})

const list1 = ref([
  {
    id: '1',
    name: 'Joao',
  },
  {
    id: '2',
    name: 'Jean',
  },
  {
    id: '3',
    name: 'Johanna',
  },
  {
    id: '4',
    name: 'Juan',
  },
])
const list2 = ref(
  list1.value.map(item => ({
    id: `${item.id}-2`,
    name: `${item.name}-2`,
  })),
)

const el1 = ref()
const el2 = ref()

useDraggable(el1, list1, {
  animation: 100,
  forceFallback: true,
  ghostClass: 'ghost',
  group: 'people',
  onAdd: () => {
    console.log('add list1')
  },
  onUpdate: () => {
    console.log('update list1')
  },
  remove: () => {
    console.log('remove list1')
  },
})

useDraggable(el2, list2, {
  animation: 100,
  forceFallback: true,
  ghostClass: 'ghost',
  group: 'people',
  onAdd: () => {
    console.log('add list2')
  },
  onUpdate: () => {
    console.log('update list2')
  },
  remove: () => {
    console.log('remove list2')
  },
})
</script>

<template>
  <div class="flex">
    <section
      ref="el1"
      class="w-300px h-300px m-auto flex flex-col gap-2 overflow-auto rounded-sm bg-gray-500/5 p-4"
    >
      <div
        v-for="item in list1"
        :key="item.id"
        class="h-30 cursor-move rounded-sm bg-gray-500/5 p-3"
      >
        {{ item.name }}
      </div>
    </section>
    <section
      ref="el2"
      class="w-300px h-300px m-auto flex flex-col gap-2 overflow-auto rounded-sm bg-gray-500/5 p-4"
    >
      <div
        v-for="item in list2"
        :key="item.id"
        class="h-30 cursor-move rounded-sm bg-gray-500/5 p-3"
      >
        {{ item.name }}
      </div>
    </section>
  </div>
</template>
