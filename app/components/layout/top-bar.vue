<script lang="ts" setup>
const { playbackStatus, playPauseCurrentTrack } = usePlayback()

function handlePlayPause() {
  const action = playbackStatus.value?.is_playing ? 'Pause' : 'Resume'
  playPauseCurrentTrack(action)
}
</script>

<template>
  <div class="flex h-32 items-center gap-24 border-b px-16 *:h-8 *:shrink-0">
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
  </div>
</template>
