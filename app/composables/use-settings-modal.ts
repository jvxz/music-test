export const SETTINGS_MODAL_TABS = [
  'general',
  'library',
  'layout',
  'track-list',
  'appearance',
  'last-fm',
  'advanced',
] as const

export function useSettingsModal() {
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
}
