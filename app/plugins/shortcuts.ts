export default defineNuxtPlugin({
  parallel: true,
  setup: () => {
    const activeElement = useActiveElement()
    const { open: settingsModalOpen } = useSettingsModal()

    // play/pause
    onKeyStrokeSafe('space', () => !settingsModalOpen.value && usePlayback().playPauseCurrentTrack(), { activeElement })

    onKeyStrokeSafe('meta_comma', () => useSettingsModal().toggleSettingsModal(), { activeElement })

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
