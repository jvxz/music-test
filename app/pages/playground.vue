<script lang="ts" setup>
definePageMeta({
  layout: false,
})

const ts = useTimestamp()
</script>

<template>
  <div class="flex h-screen flex-col items-center justify-center gap-2">
    <UButton
      @click="$tauri.rpc.control_playback({
        Play: '/rua01.ogg',
      })"
    >
      play rua01
    </UButton>
    <UButton
      @click="$tauri.rpc.control_playback({
        Play: '/rua02.ogg',
      })"
    >
      play rua02
    </UButton>
    <UButton
      @click="$tauri.rpc.control_playback({
        SetLoop: true,
      })"
    >
      enable loop
    </UButton>
    <UButton
      @click="$tauri.rpc.control_playback({
        SetLoop: false,
      })"
    >
      disable loop
    </UButton>
    <pre>{{ ts }}</pre>
  </div>
</template>
