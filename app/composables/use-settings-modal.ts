export const SETTINGS_MODAL_TABS = [
  'general',
  'library',
  'layout',
  'appearance',
  'lastFm',
  'advanced',
] as const

export const useSettingsModal = createSharedComposable(() => {
  const open = useState('settings-modal-open', () => false)
  const tab = useState('settings-modal-tab', () => SETTINGS_MODAL_TABS[0])

  function toggleSettingsModal() {
    open.value = !open.value
  }

  whenever(() => !open.value, () => blurActiveElement())

  return {
    open,
    tab,
    toggleSettingsModal,
  }
})
