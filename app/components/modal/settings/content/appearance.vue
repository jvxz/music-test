<script lang="ts" setup>
const themeTokens = ['background', 'border', 'foreground', 'primary', 'surface', 'muted'] as const
</script>

<template>
  <ModalSettingsContentLayout title="Appearance">
    <div class="flex flex-col gap-4 w-full max-w-2/3">
      <ModalSettingsContentAppearancePresets />
      <ModalSettingsContentAppearanceColorPicker
      v-for="token in themeTokens"
      :key="token"
      :setting-key="`appearance.token.${token}`"
      />
      <ModalSettingsContentAppearanceFont />
    </div>
  </ModalSettingsContentLayout>
</template>
