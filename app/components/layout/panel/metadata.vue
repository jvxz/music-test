<script lang="ts" setup>
const { currentTrack } = usePlayback()
</script>

<template>
  <LayoutPanelLayout class="gap-0 p-0">
    <div class="flex w-full items-center gap-1 border-b pr-2 pl-1">
      <div class="m-1 flex items-center gap-1">
        <UButton
          :disabled="true"
          variant="ghost"
          size="icon"
          class="size-6 shrink-0"
          title="Save changes to file"
        >
          <Icon name="tabler:check" />
        </UButton>
        <UButton
          :disabled="true"
          variant="ghost"
          size="icon"
          class="size-6 shrink-0"
          title="Save changes to file"
        >
          <Icon name="tabler:restore" />
        </UButton>
      </div>
      <p class="w-full flex-1 truncate text-xs font-medium text-muted-foreground" :title="currentTrack?.filename">
        {{ currentTrack?.filename }}
      </p>
    </div>
    <div class="flex flex-col gap-2 p-4">
      <LayoutPanelMetadataField
        v-for="frame in $settings.layout.element.metadataView.frames"
        :key="frame"
        :id3-frame="frame"
        :track="currentTrack"
      />
    </div>
  </LayoutPanelLayout>
</template>
