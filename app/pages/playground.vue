<script lang="ts" setup>
definePageMeta({
  layout: false,
})

function handleClick() {
  $db().insertInto('playlists').values({
    name: 'My new playlist',
  }).execute()
}
</script>

<template>
  <div class="flex h-screen flex-col items-center justify-center gap-2">
    <UButton
      @click="handleClick"
    >
      test
    </UButton>
  </div>
</template>
