<script lang="ts" setup>
const { layoutPanels } = usePersistentPanels('main', [12.5, 35, 12.5])
const router = useRouter()
const { $tauri } = useNuxtApp()

onBeforeMount(async () => {
  const lastUrl = await $tauri.store.get<string>('last-url')

  if (lastUrl) {
    router.push(lastUrl)
  }
  router.afterEach((to) => {
    if (to.fullPath === '/playground')
      return

    $tauri.store.set('last-url', to.fullPath)
  })
})
</script>

<template>
  <div class="flex h-screen flex-col">
    <LayoutTopBar />
    <SplitterGroup
      direction="horizontal"
      class="flex size-full flex-1"
      @layout="layoutPanels = $event"
    >
      <SplitterPanel
        :max-size="35"
        :min-size="12.5"
        class="flex shrink-0 flex-col border-r"
        :default-size="layoutPanels[0]"
      >
        <LayoutSidebarLeft />
      </SplitterPanel>
      <SplitterResizeHandle />
      <SplitterPanel class="flex-1">
        <slot />
        <LayoutWaveform />
      </SplitterPanel>
      <SplitterResizeHandle />
      <SplitterPanel
        :max-size="35"
        :min-size="12.5"
        :default-size="layoutPanels[2]"
        class="shrink-0 border-l"
      >
        <LayoutSidebarRight />
      </SplitterPanel>
    </SplitterGroup>
    <LayoutStatusBar />
  </div>
</template>
