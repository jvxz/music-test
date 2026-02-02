<script lang="ts" setup>
const settings = useSettings()

const clickOutsideToDeselect = settings.general.clickOutsideToDeselect
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
