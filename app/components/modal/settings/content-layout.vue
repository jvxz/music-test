<script lang="ts" setup>
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="flex flex-col gap-4 justify-self-start">
    <h1 class="text-lg font-medium">
      {{ sentenceCase(title) }}
    </h1>
    <slot />
  </div>
</template>
