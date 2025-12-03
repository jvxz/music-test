<script lang="ts" setup>
const { layoutPanels } = useLayoutPanels()

const sidebarButtons = [
  {
    icon: 'tabler:playlist',
    name: 'Playlists',
    slug: 'playlists',
  },
  {
    icon: 'tabler:music',
    name: 'Tracks',
    slug: 'tracks',
  },
  {
    icon: 'tabler:user',
    name: 'Artists',
    slug: 'artists',
  },

] as const
</script>

<template>
  <div class="flex h-screen flex-col">
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
        <div class="flex h-16 items-center justify-center border-b">
          music-player
        </div>
        <div class="flex flex-col gap-4 p-4">
          <UInput placeholder="Search library" />
          <div class="flex flex-col gap-1">
            <UButton
              v-for="button in sidebarButtons"
              :key="button.slug"
              variant="ghost"
              class="justify-start"
            >
              <Icon :name="button.icon" class="size-4" />
              <span>{{ button.name }}</span>
              <div class="grow" />
              <Icon name="tabler:chevron-down" class="size-4" />
            </UButton>
          </div>
        </div>
      </SplitterPanel>
      <SplitterResizeHandle />
      <SplitterPanel class="flex-1">
        <slot />
      </SplitterPanel>
      <SplitterResizeHandle />
      <SplitterPanel
        :max-size="35"
        :min-size="12.5"
        :default-size="layoutPanels[2]"
        class="shrink-0 border-l"
      >
        Sidebar
      </SplitterPanel>
    </SplitterGroup>
    <LayoutPlayer />
  </div>
</template>
