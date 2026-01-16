<script lang="ts" setup>
const themeTokens = ['background', 'border', 'foreground', 'primary', 'surface', 'muted'] as const
</script>

<template>
  <ModalSettingsContentTabLayout title="Appearance">
    <div class="flex w-full max-w-2/3 flex-col gap-4">
      <ModalSettingsContentAppearancePresets />
      <ModalSettingsContentAppearanceColorPicker
        v-for="token in themeTokens"
        :key="token"
        :setting-key="`appearance.token.${token}`"
      />
      <ModalSettingsContentAppearanceFont />
    </div>
  </ModalSettingsContentTabLayout>
</template>
