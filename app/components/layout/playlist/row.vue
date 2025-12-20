<script lang="ts" setup>
defineProps<{
  entry: FileEntry
  isSelected: boolean
  isPlaying: boolean
}>()

const emits = defineEmits<{
  selectTrack: [track: FileEntry]
  playTrack: [path: string]
}>()

const classes = 'flex items-center'
</script>

<template>
  <div
    class="col-span-full grid grid-cols-subgrid not-last:border-b"
    :class="{
      'bg-primary/25': isSelected,
    }"
    @dblclick.left="emits('playTrack', entry.path)"
    @mousedown.left="emits('selectTrack', entry)"
  >
    <template
      v-for="col in PLAYLIST_COLUMNS"
      :key="col.key"
    >
      <!-- cover column -->
      <template v-if="col.key === 'cover'">
        <div
          v-if="!entry.tags.APIC"
          class="mx-auto justify-center"
          :class="classes"
        >
          -
        </div>

        <img
          v-else
          :src="entry.thumbnail_uri"
          :alt="entry.name"
          width="38"
          height="38"
          class="mx-auto h-full"
        />
      </template>
      <!-- playing column -->
      <div
        v-else-if="col.key === 'playing'"
        :class="classes"
        class="justify-center"
      >
        <Icon
          v-if="isPlaying"
          name="tabler:player-play"
          class="size-3!"
        />
      </div>
      <!-- other columns -->
      <p
        v-else
        :class="classes"
        class="truncate px-2 text-sm"
        :title="col.id3 === 'TIT2' ? entry.tags[col.id3] ?? entry.name : entry.tags[col.id3 ?? '']"
      >
        {{ col.id3 === 'TIT2' ? entry.tags[col.id3] ?? entry.name : entry.tags[col.id3 ?? ''] }}
      </p>
    </template>
  </div>
</template>
