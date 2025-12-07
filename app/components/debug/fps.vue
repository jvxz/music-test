<script lang="ts" setup>
const fps = useFps()
</script>

<template>
  <div class="absolute right-2 bottom-2 text-xs text-muted-foreground">
    {{ fps }}
  </div>
</template>
