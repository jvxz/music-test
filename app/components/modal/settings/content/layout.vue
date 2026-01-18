<script lang="ts" setup>
const { getSettingValueRef } = useSettings()
const allowResizing = getSettingValueRef('layout.allow-resizing')
</script>

<template>
  <ModalSettingsContentTabLayout title="Layout" class="flex h-full flex-col gap-4">
    <div class="flex justify-between gap-4">
      <ModalSettingsContentLayoutPanels />
      <ModalSettingsContentLayoutElements />
    </div>
    <USeparator />
    <div class="shrink-0">
      <div class="flex items-center gap-2">
        <UCheckbox id="allowResizing" v-model:model-value="allowResizing" />
        <ULabel for="allowResizing">
          Allow resizing
        </ULabel>
      </div>
    </div>
  </ModalSettingsContentTabLayout>
</template>
