<script lang="ts" setup>
const { currentTrack } = usePlayback()

const { getElementSettings } = useLayout()
const elementSettings = getElementSettings('player')
</script>

<template>
  <div class="flex items-center justify-between gap-4 p-4">
    <div class="flex h-full flex-1 items-center">
      <div class="flex h-full items-start gap-4">
        <LayoutPanelCoverArt
          v-if="elementSettings.showTrackCover"
          :key="elementSettings.titlePosition"
          no-cover-text=""
          :classes="{
            noCoverText: 'border border-dashed border-primary',
            img: elementSettings.roundTrackCover ? 'rounded' : '',
            root: 'aspect-square shrink-0 h-full flex',
          }"
        />
        <LayoutPanelPlayerTitle v-if="elementSettings.titlePosition === 'left'" :current-track />
      </div>
      <LayoutPanelPlayerControls v-if="elementSettings.controlsPosition === 'left'" class="mx-auto" />
    </div>

    <div class="flex w-[45%] shrink-0 flex-col items-center justify-center gap-4">
      <LayoutPanelPlayerTitle v-if="elementSettings.titlePosition === 'center'" :current-track />
      <LayoutPanelPlayerControls v-if="elementSettings.controlsPosition === 'center'" class="mx-auto" />
      <LayoutPanelPlayerSeekBar
        show-duration="both-sides"
        :show-title="false"
        :classes="{
          container: 'w-full h-fit grow-0 translate-y-0',
          thumb: 'size-4 rounded-full',
        }"
      />
    </div>
    <div class="flex flex-1 justify-end gap-4">
      <LayoutPanelPlayerVolume class="translate-y-0" />
      <div class="flex items-center gap-2">
        <UButton variant="ghost" size="icon">
          <Icon name="tabler:info-circle" class="size-4!" />
        </UButton>
        <UButton variant="ghost" size="icon">
          <Icon name="tabler:settings" class="size-4!" />
        </UButton>
      </div>
    </div>
  </div>
</template>
