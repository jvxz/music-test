<script lang="ts" setup>
const { rpc } = useTauri()
const res = useAsyncState(() => rpc.read_folder('/path/to/folder/').then(
  (entries) => {
    console.log(entries)
    return entries
  },
), null)
</script>

<template>
  <div class="flex h-full flex-col gap-4 overflow-y-auto p-4 *:shrink-0">
    <UCard v-for="entry in res.state.value" :key="entry.path">
      <p>{{ entry.tags.find(tag => tag.key === "TPE1")?.value }} - {{ entry.tags.find(tag => tag.key === "TIT2")?.value }}</p>
    </UCard>
  </div>
</template>
