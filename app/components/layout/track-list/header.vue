<script lang="ts" setup>
const props = defineProps<{
  path: string
  type: 'folder' | 'playlist'
  trackCount: number
  isLoading: boolean
}>()

const { getPlaylistName } = useUserPlaylists()

const title = computed(() => {
  if (props.type === 'folder')
    return props.path

  return getPlaylistName(Number(props.path))
})
</script>

<template>
  <div class="flex h-16 flex-col justify-center border-b bg-background px-4">
    <p class="text-lg font-medium">
      {{ title }}
    </p>
    <USpinner v-if="isLoading" class="h-[20px]" />
    <p v-else class="text-sm text-muted-foreground">
      {{ trackCount }} {{ checkPlural(trackCount, 'tracks', 'track') }}
    </p>
  </div>
</template>
