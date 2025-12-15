export default defineNuxtPlugin({
  parallel: true,
  setup: () => {
    const activeElement = useActiveElement()

    // toggle theme
    onKeyStrokeSafe('shift_t', () => toggleColorMode(), { activeElement })

    // play/pause
    onKeyStrokeSafe('space', () => usePlayback().playPauseCurrentTrack(), { activeElement })
  },
})
