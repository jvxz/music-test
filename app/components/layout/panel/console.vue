<script lang="ts" setup>
import type { Error } from '~/types/tauri-bindings'

const consoleStore = useConsole()

const sourceColorMap: Record<Error['type'], string> = {
  Audio: 'text-primary',
  Backend: 'text-blue-500',
  FileSystem: 'text-yellow-500',
  Id3: 'text-green-500',
  LastFm: 'text-red-500',
  Other: 'text-muted-foreground',
  Sql: 'text-pink-500',
  Store: 'text-teal-500',
  Stronghold: 'text-indigo-500',
  Waveform: 'text-red-500',
}
</script>

<template>
  <LayoutPanelLayout class="flex size-full p-2 text-sm">
    <div
      v-for="message in consoleStore.consoleMessages"
      :key="message.timestamp"
      class="shrink-0 *:select-auto *:pr-1.5"
    >
      <span class="font-mono text-muted-foreground">
        {{ $dayjs(message.timestamp).format('HH:mm') }}
      </span>
      <span
        v-if="message.source"
        class="font-medium"
        :class="sourceColorMap[message.source]"
      >
        {{ message.source }}
      </span>
      <span class="text-pretty">
        {{ message.text }}
      </span>
    </div>
  </LayoutPanelLayout>
</template>
