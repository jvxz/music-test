export default defineNuxtPlugin({
  dependsOn: ['tauri'],
  parallel: true,
  setup: () => {
    const settings = useSettings()

    useStyleTag(computed(() => `
      body {
        font-family: ${settings.appearance.font.name};
        font-weight: ${settings.appearance.font.weight};
        font-style: ${settings.appearance.font.variant};
      }
    `))
  },
})
