<script lang="ts" setup>
import { Colord } from 'colord'

const { settingKey } = defineProps<{
  settingKey: SettingsEntryKey
}>()

const { getSettingValueRef } = useSettings()

const label = computed(() => sentenceCase(settingKey.split('.').pop()!))

const color = getSettingValueRef(settingKey) as Ref<string>

const colorPicker = shallowRef<HTMLInputElement | null>(null)
function handleColorPickerClick() {
  if (!colorPicker.value)
    return
  colorPicker.value?.click()
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <ULabel class="text-sm">
      {{ label }}
    </ULabel>
    <div class="relative flex items-center gap-1">
      <UButton
        class="aspect-square"
        :style="{
          backgroundColor: color,
          borderColor: new Colord(color).lighten(0.1).toHex(),
        }"
        @click="handleColorPickerClick"
      />
      <input
        ref="colorPicker"
        v-model="color"
        type="color"
        class="invisible absolute inset-0 -left-2"
      />
      <UInput v-model="color" />
    </div>
  </div>
</template>
