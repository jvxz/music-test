<script lang="ts" setup>
const settings = useSettings()
</script>

<template>
  <WindowSettingsContentTabLayout title="Layout" class="flex h-full flex-col gap-4">
    <div class="relative flex justify-between gap-4">
      <div class="flex w-1/2 flex-col gap-6">
        <WindowSettingsContentLayoutPanels
          v-for="panel in layoutPanels"
          :key="panel.label"
          :panel
        />
      </div>

      <WindowSettingsContentLayoutElements />
      <WindowSettingsContentLayoutElementSettings />
    </div>
    <USeparator />
    <div class="shrink-0">
      <div class="flex items-center gap-2">
        <UCheckbox id="allowResizing" v-model:model-value="settings.layout.allowResizing" />
        <ULabel for="allowResizing">
          Allow resizing
        </ULabel>
      </div>
    </div>
  </WindowSettingsContentTabLayout>
</template>
