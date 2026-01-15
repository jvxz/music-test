export function useLayout() {
  const { getSettingValue, setSettingValue } = useSettings()

  const elementDragging = useState<LayoutElementKey | null>('layout-element-dragging', () => null)

  function addElementToPanel(panelKey: LayoutPanelKey, elementKey: LayoutElementKey) {
    const settingKey = getPanelSettingKey(panelKey)

    const settingValue = getSettingValue(settingKey)
    setSettingValue(settingKey, [...settingValue, elementKey])
  }

  function removeElementFromPanel(panelKey: LayoutPanelKey, elementKey: LayoutElementKey) {
    const settingKey = getPanelSettingKey(panelKey)

    const settingValue = getSettingValue(settingKey)
    setSettingValue(settingKey, settingValue.filter(value => value !== elementKey))
  }

  function getPanelSettingKey(panelKey: LayoutPanelKey) {
    return `layout.panel.${panelKey}` satisfies SettingsEntryKey
  }

  return {
    addElementToPanel,
    elementDragging,
    removeElementFromPanel,
  }
}
