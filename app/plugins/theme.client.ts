export default defineNuxtPlugin({
  parallel: true,
  setup: () => {
    const keys = useMagicKeys()

    // @ts-expect-error - keys.shift_t is not typed
    whenever(keys.shift_t, () => toggleColorMode())
  },
})
