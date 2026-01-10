export default defineNuxtPlugin({
  parallel: true,
  setup: () => {
    const activeElement = useActiveElement()

    // play/pause
    onKeyStrokeSafe('space', () => usePlayback().playPauseCurrentTrack(), { activeElement })

    onKeyStrokeSafe('meta_comma', () => useSettingsModal().toggleSettingsModal(), { activeElement })

    useEventListener('keydown', (e) => {
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault()
      }
    })
  },
})
