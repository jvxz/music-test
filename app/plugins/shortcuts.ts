export default defineNuxtPlugin({
  dependsOn: ['tauri'],
  parallel: true,
  setup: () => {
    const activeElement = useActiveElement()
    const { createSettingsWindow } = useSettingsWindow()

    // play/pause
    onKeyStrokeSafe('space', () => usePlayback().playPauseCurrentTrack(), { activeElement })

    onKeyStrokeSafe('meta_comma', () => createSettingsWindow(), { activeElement })

    if (import.meta.dev) {
      onKeyStrokeSafe('meta_r', () => {
        window.location.reload()
      }, { activeElement })
    }

    useEventListener('keydown', (e) => {
      const blacklist = [' ', 'backspace']
      if (blacklist.includes(e.key.toLowerCase()) && e.target === document.body) {
        e.preventDefault()
      }
    })
  },
})
