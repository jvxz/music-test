<script lang="ts" setup>
import { Colord } from 'colord'

const { settingKey } = defineProps<{
  settingKey: keyof Settings['appearance']['token']
}>()

const settings = useSettings()

const label = computed(() => upperFirst(settingKey.split('.').pop()!))

const isColorValid = shallowRef(true)

const colorPicker = shallowRef<HTMLInputElement | null>(null)
function handleColorPickerClick() {
  if (!colorPicker.value)
    return
  colorPicker.value?.click()
}

const localColor = refWithControl(settings.appearance.token[settingKey], {
  onBeforeChange: (color) => {
    const isValid = new Colord(color).isValid()
    isColorValid.value = isValid

    if (isValid)
      settings.appearance.token[settingKey] = color
  },
})
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
          backgroundColor: settings.appearance.token[settingKey],
          borderColor: new Colord(settings.appearance.token[settingKey]).lighten(0.1).toHex(),
        }"
        @click="handleColorPickerClick"
      />
      <input
        ref="colorPicker"
        v-model="localColor"
        type="color"
        class="invisible absolute inset-0 -left-2"
      />
      <UInput
        v-model="localColor"
        :class="{
          'border-danger': !isColorValid,
        }"
      />
    </div>
  </div>
</template>
