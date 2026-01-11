export default defineNuxtPlugin({
  dependsOn: ['tauri'],
  parallel: true,
  setup: () => {
    const { getSettingValueRef } = useSettings()
    const appearanceFont = getSettingValueRef('appearance.font.name')
    const appearanceFontWeight = getSettingValueRef('appearance.font.weight')
    const appearanceFontVariant = getSettingValueRef('appearance.font.variant')

    useStyleTag(computed(() => `
      body {
        font-family: ${appearanceFont.value};
        font-weight: ${appearanceFontWeight.value};
        font-style: ${appearanceFontVariant.value};
      }
    `))
  },
})
