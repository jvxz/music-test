<script lang="ts" setup>
const { getSettingValueRef, setSettingValues } = useSettings()

const presets = getSettingValueRef('appearance.presets')

const presetArray = computed(() => Array.from(Object.entries(presets.value)).map(([name, colors]) => ({
  colors,
  name,
})))

function handlePresetClick(preset: typeof presetArray.value[number]) {
  setSettingValues(preset.colors as Record<SettingsEntryKey, SettingsEntryValue<SettingsEntryKey>>)
}
</script>

<template>
  <div class="grid grid-cols-5 gap-2">
    <button
      v-for="preset in presetArray"
      :key="preset.name"
      class="grid h-16 grid-cols-2 overflow-hidden rounded border"
      @click="handlePresetClick(preset)"
    >
      <div class="size-full" :style="{ backgroundColor: preset.colors['appearance.token.background'] }"></div>
      <div class="size-full" :style="{ backgroundColor: preset.colors['appearance.token.border'] }"></div>
      <div class="size-full" :style="{ backgroundColor: preset.colors['appearance.token.foreground'] }"></div>
      <div class="size-full" :style="{ backgroundColor: preset.colors['appearance.token.primary'] }"></div>
    </button>
  </div>
</template>
