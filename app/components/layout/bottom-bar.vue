<script lang="ts" setup>
const { playbackStatus, playPauseCurrentTrack } = usePlayback()
</script>

<template>
  <div class="flex h-32 w-full flex-col items-center justify-center gap-4 border-t">
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
        container: 'h-fit grow-0 translate-y-0',
        thumb: 'size-4 rounded-full',
      }"
    />
  </div>
</template>
