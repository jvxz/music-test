export default defineNuxtPlugin({
  parallel: true,
  setup: () => {
    const activeElement = useActiveElement()
    const { open: settingsModalOpen } = useSettingsModal()

    // play/pause
    onKeyStrokeSafe('space', () => !settingsModalOpen.value && usePlayback().playPauseCurrentTrack(), { activeElement })

    onKeyStrokeSafe('meta_comma', () => useSettingsModal().toggleSettingsModal(), { activeElement })

    useEventListener('keydown', (e) => {
      const blacklist = [' ', 'backspace']
      if (blacklist.includes(e.key.toLowerCase()) && e.target === document.body) {
        e.preventDefault()
      }
    })
  },
})
