<script lang="ts" setup>
definePageMeta({
  category: 'interface',
  description: 'Create new webview in a detached window',
  icon: 'lucide:app-window',
  name: 'Webview',
})

const { app } = useAppConfig()
const toast = useToast()

async function openWindow(id: string, page: string) {
  const webview = new useTauriWebviewWindowWebviewWindow(id, {
    height: 720,
    title: 'Nuxtor webview',
    url: page,
    width: 1280,
  })

  webview.once('tauri://created', () => {
    toast.add({
      color: 'success',
      description: 'Webview created',
      title: 'Success',
    })
  })
  webview.once('tauri://error', (error) => {
    toast.add({
      color: 'error',
      description: (error as any).payload,
      title: 'Error',
    })
  })
}
</script>

<template>
  <LayoutTile
    title="Webview window"
    description="Create new webview in a detached window. This will create a new window flagged 'secondary' that has the same permissions as the main one. If you need more windows, update the permissions under capabilities > main or create a new capabilities file for the new window only."
  >
    <div class="flex flex-col items-center gap-6">
      <UButton variant="subtle" @click="openWindow((new Date).valueOf().toString(), app.repo)">
        Create external Webview
      </UButton>
      <UButton variant="subtle" @click="openWindow('secondary', '/os')">
        Create internal Webview
      </UButton>
    </div>
  </LayoutTile>
</template>
