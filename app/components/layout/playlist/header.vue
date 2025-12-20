<script lang="ts" setup>
defineProps<{
  path: string
  trackCount: number
}>()
</script>

<template>
  <div class="flex h-16 flex-col justify-center border-b bg-background px-4">
    <p class="text-lg font-medium">
      {{ path }} 
    </p>
    <p class="text-sm text-muted-foreground">
      {{ trackCount }} tracks
    </p>
  </div>
</template>
