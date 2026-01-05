<script lang="ts" setup>
const themeTokens = ['background', 'foreground', 'primary', 'border', 'surface'] as const
</script>

<template>
  <ModalSettingsContentLayout title="Appearance">
    <div class="flex flex-col gap-4">
      <ModalSettingsContentAppearanceColorPicker
        v-for="token in themeTokens"
        :key="token"
        :setting-key="`appearance.${token}`"
      />
    </div>
  </ModalSettingsContentLayout>
</template>
