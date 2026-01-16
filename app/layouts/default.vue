<script lang="ts" setup>
const router = useRouter()
const tauri = useTauri()

onBeforeMount(async () => {
  const lastUrl = await tauri.store.get<string>('last-url')

  if (lastUrl) {
    router.push(lastUrl)
  }
  router.afterEach((to) => {
    if (to.fullPath === '/playground')
      return

    tauri.store.set('last-url', to.fullPath)
  })
})

const { getPanelElements, getPanelSize, handlePanelSizeChange } = useLayout()

const topPanelElements = getPanelElements('top')
const leftPanelElements = getPanelElements('left')
const mainPanelElements = getPanelElements('main')
const rightPanelElements = getPanelElements('right')
const bottomPanelElements = getPanelElements('bottom')

const leftPanelSize = getPanelSize('left')
const mainPanelSize = getPanelSize('main')
const rightPanelSize = getPanelSize('right')

const visiblePanels = computed(() => {
  const panels: LayoutPanelKey[] = []
  if (leftPanelElements.value.length)
    panels.push('left')
  if (mainPanelElements.value.length)
    panels.push('main')
  if (rightPanelElements.value.length)
    panels.push('right')
  return panels
})

const onLayoutChange = useDebounceFn((sizes: number[]) => {
  visiblePanels.value.forEach((key, index) => {
    handlePanelSizeChange(key, sizes[index])
  })
}, 200)
</script>

<template>
  <div class="flex h-screen flex-col">
    <div class="h-8 w-full border-b bg-background" />
    <LayoutTopBar v-if="topPanelElements.length" />
    <SplitterGroup
      :key="visiblePanels.join('-')"
      direction="horizontal"
      class="flex size-full flex-1"
      @layout="onLayoutChange"
    >
      <template v-if="leftPanelElements.length">
        <SplitterPanel
          v-if="leftPanelElements.length"
          key="left"
          :max-size="35"
          :min-size="12.5"
          class="flex shrink-0 flex-col border-r"
          :default-size="leftPanelSize"
        >
          <LayoutSidebarLeft />
        </SplitterPanel>
        <SplitterResizeHandle />
      </template>
      <SplitterPanel
        v-if="mainPanelElements.length"
        key="main"
        class="flex h-full flex-1 flex-col"
        :default-size="mainPanelSize"
      >
        <slot />
      </SplitterPanel>
      <template v-if="rightPanelElements.length">
        <SplitterResizeHandle />
        <SplitterPanel
          key="right"
          :max-size="35"
          :min-size="12.5"
          :default-size="rightPanelSize"
          class="shrink-0 border-l"
        >
          <LayoutSidebarRight />
        </SplitterPanel>
      </template>
    </SplitterGroup>
    <LayoutBottomBar v-if="bottomPanelElements.length" />
    <!-- <LayoutStatusBar /> -->
  </div>
</template>
