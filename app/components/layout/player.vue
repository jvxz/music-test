<script lang="ts" setup>
const tauri = useTauri()
</script>

<template>
  <div class="flex h-36 shrink-0 items-center justify-center border-t">
    <UButton @click="tauri.invoke('read_file_test')">
      Play
    </UButton>
  </div>
</template>
