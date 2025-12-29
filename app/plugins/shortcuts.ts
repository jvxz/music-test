export default defineNuxtPlugin({
  parallel: true,
  setup: () => {
    const activeElement = useActiveElement()
    const magicKeys = useMagicKeys()

    // toggle theme
    onKeyStrokeSafe('shift_t', () => toggleColorMode(), { activeElement, magicKeys })

    // play/pause
    onKeyStrokeSafe('space', () => usePlayback().playPauseCurrentTrack(), { activeElement, magicKeys })

    onKeyStrokeSafe('meta_comma', () => useSettingsModal().toggleSettingsModal(), { activeElement, magicKeys })

    useEventListener('keydown', (e) => {
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault()
      }
    })
  },
})
