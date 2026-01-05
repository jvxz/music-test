export default defineNuxtPlugin({
  dependsOn: ['tauri'],
  parallel: true,
  setup: () => {
    const { settings } = useSettings()

    useStyleTag(computed(() => `
      :root {
        --background: ${settings.value['appearance.background']};
        --foreground: ${settings.value['appearance.foreground']};
        --primary: ${settings.value['appearance.primary']};
        --border: ${settings.value['appearance.border']};
        --card: ${settings.value['appearance.surface']};
      }
    `))
  },
})
