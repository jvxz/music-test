export default defineNuxtPlugin({
  dependsOn: ['tauri'],
  parallel: true,
  setup: () => {
    const { settings } = useSettings()

    useStyleTag(computed(() => `
      :root {
        --background: ${settings.value['appearance.token.background']};
        --foreground: ${settings.value['appearance.token.foreground']};
        --primary: ${settings.value['appearance.token.primary']};
        --border: ${settings.value['appearance.token.border']};
        --card: ${settings.value['appearance.token.surface']};
      }
    `))
  },
})
