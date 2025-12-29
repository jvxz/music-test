export const useSettingsModal = createSharedComposable(() => {
  const open = ref(false)

  function toggleSettingsModal() {
    open.value = !open.value
  }

  return {
    open,
    toggleSettingsModal,
  }
})
