<script lang="ts" setup>
const { currentTrack } = usePlayback()
</script>

<template>
  <div class="grid size-full place-items-center">
    <template v-if="currentTrack">
      <img
        v-if="currentTrack.tags.APIC"
        :src="currentTrack.full_uri"
        class="h-full w-full object-contain"
      />
      <div
        v-else
        class="grid h-full w-full place-items-center object-contain text-sm text-muted-foreground font-mono"
      >
        no cover
      </div>
    </template>
    <!-- <div
      v-else
      class="grid h-full w-full place-items-center object-contain text-sm text-muted-foreground font-mono"
    >
      no track
    </div> -->
  </div>
</template>
