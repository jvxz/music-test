<script lang="ts" setup>
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="flex w-full flex-col gap-4 justify-self-start">
    <h1 v-if="title" class="text-lg font-medium">
      {{ sentenceCase(title, {
        delimiter: '.',
      }) }}
    </h1>
    <div v-bind="$attrs">
      <slot />
    </div>
  </div>
</template>
