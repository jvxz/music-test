<script lang="ts" setup>
const { rpc } = useTauri()
const { execute, state: res } = useAsyncState((path: string) => rpc.read_folder(path), [])
</script>

<template>
  <div class="flex h-full flex-col gap-4 overflow-y-auto p-4 *:shrink-0">
    <div class="flex gap-2">
      <UButton @click="execute(0, 'path1')">
        read path1
      </UButton>
      <UButton @click="execute(0, 'path2')">
        read path2
      </UButton>
    </div>
    <UCard v-for="entry in res" :key="entry.path">
      <p>{{ entry.tags.find(tag => tag.key === "TPE1")?.value }} - {{ entry.tags.find(tag => tag.key === "TIT2")?.value }}</p>
    </UCard>
  </div>
</template>
