<script lang="ts" setup>
const { getSettingValueRef } = useSettings()

const clickOutsideToDeselect = getSettingValueRef('general.click-outside-to-deselect')
</script>

<template>
  <ModalSettingsContentTabLayout title="General">
    <div class="flex gap-2">
      <USwitch
        id="clickOutsideToDeselect"
        v-model:model-value="clickOutsideToDeselect"
      />
      <ULabel for="clickOutsideToDeselect">
        Click outside of track list to deselect
      </ULabel>
    </div>
  </ModalSettingsContentTabLayout>
</template>
