<script lang="ts" setup>
const { getSettingValueRef } = useSettings()
const panelElements = getSettingValueRef('layout.panel.top')
</script>

<template>
  <div class="h-32 border-b">
    <!-- <template v-if="panelElements.includes('player')">
      <div class="flex flex-1 items-center justify-between *:active:text-muted-foreground">
        <div class="flex items-center gap-1">
          <button>
            <Icon name="tabler:player-skip-back-filled" class="size-6!" />
          </button>
          <button @click="handlePlayPause()">
            <Icon :name="playbackStatus?.is_playing ? 'tabler:player-pause-filled' : 'tabler:player-play-filled'" class="size-8!" />
          </button>
          <button>
            <Icon name="tabler:player-skip-forward-filled" class="size-6!" />
          </button>
        </div>
        <LayoutTopBarVolume />
      </div>
      <LayoutTopBarSeekBar />
      <div class="flex flex-1 items-center justify-between">
        <LayoutTopBarRepeat />
      </div>
    </template> -->
    <SplitterGroup direction="horizontal">
      <LayoutPanel
        v-for="(element, idx) in panelElements"
        :key="element"
        :element="element"
        :with-resize-handle="idx !== panelElements.length - 1"
      />
    </SplitterGroup>
  </div>
</template>
