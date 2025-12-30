export const SETTINGS_MODAL_TABS = ['general', 'library', 'appearance', 'advanced'] as const

export function useSettingsModal() {
  const open = useState('settings-modal-open', () => false)
  const tab = useState('settings-modal-tab', () => SETTINGS_MODAL_TABS[0])

  function toggleSettingsModal() {
    open.value = !open.value
  }

  return {
    open,
    tab,
    toggleSettingsModal,
  }
}
