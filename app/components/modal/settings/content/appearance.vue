<script lang="ts" setup>
const themeTokens = ['background', 'border', 'foreground', 'primary', 'surface'] as const
</script>

<template>
  <ModalSettingsContentLayout title="Appearance">
    <div class="flex flex-col gap-4">
      <ModalSettingsContentAppearancePresets />
      <USeparator />
      <ModalSettingsContentAppearanceColorPicker
        v-for="token in themeTokens"
        :key="token"
        :setting-key="`appearance.token.${token}`"
      />
    </div>
  </ModalSettingsContentLayout>
</template>
