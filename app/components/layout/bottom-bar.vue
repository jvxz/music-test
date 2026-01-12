<script lang="ts" setup>
const { currentTrack, playbackStatus, playPauseCurrentTrack } = usePlayback()
</script>

<template>
  <div class="flex h-32 w-full items-center justify-between gap-4 border-t p-4">
    <div class="flex h-full flex-1 items-start gap-4">
      <LayoutPanelCoverArt
        class="flex h-full"
        no-cover-text=""
        :classes="{
          noCoverText: 'border rounded border-dashed border-primary',
          img: 'rounded',
          root: 'shrink-0',
        }"
      />
      <div class="flex h-full flex-col gap-1">
        <div class="flex items-center gap-2">
          <UMarquee
            :key="currentTrack?.tags.TIT2 ?? currentTrack?.name"
            :title="currentTrack?.tags.TIT2 ?? currentTrack?.name"
            :animate-on-overflow-only="true"
            :delay="2"
            gap="0.5rem"
            :pause-on-hover="true"
            class="max-w-64"
          >
            <p :title="currentTrack?.tags.TIT2 ?? currentTrack?.name" class="font-medium">
              {{ currentTrack?.tags.TIT2 ?? currentTrack?.name }}
            </p>
          </UMarquee>
          <Icon name="tabler:dots" class="size-4!" />
        </div>
        <p class="text-sm text-muted-foreground">
          {{ currentTrack?.tags.TPE1 }}
        </p>
      </div>
    </div>
    <div class="flex w-[45%] shrink-0 flex-col items-center justify-center gap-4">
      <div class="flex items-center justify-center gap-3">
        <!-- shuffle -->
        <LayoutBottomBarPlayerButton>
          <Icon name="tabler:arrows-shuffle" class="size-5!" />
        </LayoutBottomBarPlayerButton>
        <!-- skip back -->
        <LayoutBottomBarPlayerButton>
          <Icon name="tabler:player-skip-back-filled" class="size-5!" />
        </LayoutBottomBarPlayerButton>
        <!-- play/pause -->
        <LayoutBottomBarPlayerButton variant="main" @click="playPauseCurrentTrack()">
          <Icon
            :name="playbackStatus?.is_playing
              ? 'tabler:player-pause-filled'
              : 'tabler:player-play-filled'
            "
            class="size-6! text-background"
          />
        </LayoutBottomBarPlayerButton>
        <!-- skip forward -->
        <LayoutBottomBarPlayerButton>
          <Icon name="tabler:player-skip-forward-filled" class="size-5!" />
        </LayoutBottomBarPlayerButton>
        <!-- repeat -->
        <LayoutBottomBarPlayerButton>
          <Icon
            name="tabler:repeat"
            class="size-5!"
          />
        </LayoutBottomBarPlayerButton>
      </div>
      <LayoutPlayerSeekBar
        :show-duration="false"
        :show-title="false"
        :classes="{
          container: 'w-full h-fit grow-0 translate-y-0',
          thumb: 'size-4 rounded-full',
        }"
      />
    </div>
    <div class="flex flex-1 justify-end gap-4">
      <LayoutPlayerVolume class="translate-y-0" />
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
