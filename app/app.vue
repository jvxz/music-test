<script lang="ts" setup>
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'

onMounted(async () => {
  const window = getCurrentWebviewWindow()
  await window.show()
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ModalItemSearch />
  <ModalSettings />
  <DevOnly>
    <DebugDetails />
  </DevOnly>
</template>
