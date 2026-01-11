<script lang="ts" setup>
import type { SystemFont } from 'tauri-plugin-system-fonts-api'
import { useFilter } from 'reka-ui'
import { getSystemFonts } from 'tauri-plugin-system-fonts-api'

const { getSettingValueRef } = useSettings()
const appearanceFont = getSettingValueRef('appearance.font.name')
const appearanceFontWeight = getSettingValueRef('appearance.font.weight')
const appearanceFontVariant = getSettingValueRef('appearance.font.variant')

const fontNameQuery = shallowRef('')
const dropdownOpen = shallowRef(false)

const { data: fonts, pending: isLoadingFonts } = useAsyncData<SystemFont[]>('fonts', async () => {
  const fonts = await getSystemFonts()
  return fonts.sort((a, b) => a.name.localeCompare(b.name))
}, {
  default: () => [],
})

const fontsDeduped = useArrayUnique(() => fonts.value.map(font => font.name))
const { contains } = useFilter({ sensitivity: 'base' })
const filteredFonts = computed(() => fontsDeduped.value.filter(font => contains(font, fontNameQuery.value)))

const currentFontData = computed(() => {
  const font = fonts.value.find(font => font.name === appearanceFont.value)
  if (!font)
    return null

  const variants = fonts.value.filter(f => f.fontName.startsWith(font.fontName.split('-').shift() ?? ''))
  return {
    ...font,
    variants,
  }
})

const weights = useArrayUnique(() => !currentFontData.value ? [] : currentFontData.value.variants.map(v => v.weight).sort((a, b) => a - b))
const variants = useArrayUnique(() => !currentFontData.value ? [] : [...currentFontData.value.variants.map(v => v.style).sort((a, b) => a.localeCompare(b)), 'Italic'])
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <ULabel class="text-sm">
      Font <USpinner v-if="isLoadingFonts" />
    </ULabel>
    <div class="flex items-center gap-2">
      <UComboboxRoot
        v-model:open="dropdownOpen"
        v-model:model-value="appearanceFont"
        :disabled="!fonts.length"
        class="w-96"
      >
        <UComboboxAnchor class="w-full">
          <UComboboxInput v-model="fontNameQuery" :disabled="!fonts.length" />
          <UComboboxTrigger :disabled="!fonts.length" />
        </UComboboxAnchor>
        <UComboboxList class="max-h-96">
          <UComboboxViewport>
            <ComboboxVirtualizer
              v-slot="{ option }"
              :options="filteredFonts"
              :estimate-size="24"
              :text-content="x => x"
            >
              <UComboboxItem :value="option">
                <span class="truncate">{{ option }}</span>
              </UComboboxItem>
            </ComboboxVirtualizer>
          </UComboboxViewport>
        </UComboboxList>
      </UComboboxRoot>
      <USelectRoot v-model:model-value="appearanceFontWeight">
        <USelectTrigger :disabled="!currentFontData" class="w-28">
          {{ appearanceFontWeight }}
        </USelectTrigger>
        <USelectContent v-if="currentFontData" class="min-w-0">
          <USelectItem
            v-for="weight in weights"
            :key="weight"
            :value="weight"
          >
            <USelectItemText>{{ weight }}</USelectItemText>
          </USelectItem>
        </USelectContent>
      </USelectRoot>
      <USelectRoot v-model:model-value="appearanceFontVariant">
        <USelectTrigger :disabled="!currentFontData" class="w-28">
          {{ appearanceFontVariant }}
        </USelectTrigger>
        <USelectContent v-if="currentFontData" class="min-w-0">
          <USelectItem
            v-for="variant in variants"
            :key="variant"
            :value="variant"
          >
            <USelectItemText>{{ variant }}</USelectItemText>
          </USelectItem>
        </USelectContent>
      </USelectRoot>
    </div>
  </div>
</template>
