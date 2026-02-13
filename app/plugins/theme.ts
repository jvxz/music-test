export default defineNuxtPlugin({
  dependsOn: ['tauri'],
  parallel: true,
  setup: () => {
    const settings = useSettings()

    useStyleTag(computed(() => `
      :root {
        --background: ${settings.appearance.token.background};
        --foreground: ${settings.appearance.token.foreground};
        --primary: ${settings.appearance.token.primary};
        --border: ${settings.appearance.token.border};
        --card: ${settings.appearance.token.surface};
        --muted: ${settings.appearance.token.muted};
      }
    `))

    useStyleTag(computed(() => `
      * {
        text-transform: ${settings.appearance.font.casing};
      }
    `))
  },
})
