export function useLayout() {
  const { getSettingValue, getSettingValueRef, setSettingValue } = useSettings()

  const elementDragging = useState<LayoutElementKey | null>('layout-element-dragging', () => null)

  function addElementToPanel(panelKey: LayoutPanelKey, elementKey: LayoutElementKey) {
    const settingKey = getPanelSettingKey(panelKey, 'elements')

    const settingValue = getSettingValue(settingKey)
    setSettingValue(settingKey, [...settingValue, elementKey])
  }

  function removeElementFromPanel(panelKey: LayoutPanelKey, elementKey: LayoutElementKey) {
    const settingKey = getPanelSettingKey(panelKey, 'elements')

    const settingValue = getSettingValue(settingKey)
    setSettingValue(settingKey, settingValue.filter(value => value !== elementKey))
  }

  function getPanelElements<T extends LayoutPanelKey>(panelKey: T): Ref<LayoutPanelElementsSetting<T>> {
    const settingKey = getPanelSettingKey(panelKey, 'elements')
    return getSettingValueRef(settingKey)
  }

  function getPanelSize<T extends LayoutPanelKey>(panelKey: T): Ref<number> {
    const settingKey = getPanelSettingKey(panelKey, 'size')
    return getSettingValueRef(settingKey)
  }

  const handlePanelSizeChange = (panelKey: LayoutPanelKey, size: number | undefined) => {
    if (size === undefined)
      return

    const settingKey = getPanelSettingKey(panelKey, 'size')
    setSettingValue(settingKey, size)
  }

  function getPanelSettingKey(panelKey: LayoutPanelKey, type: 'elements'): `layout.panel.${LayoutPanelKey}`
  function getPanelSettingKey(panelKey: LayoutPanelKey, type: 'size'): `layout.panel-size.${LayoutPanelKey}`
  function getPanelSettingKey(panelKey: LayoutPanelKey, type = 'elements' as 'elements' | 'size') {
    if (type === 'elements') {
      return `layout.panel.${panelKey}` satisfies SettingsEntryKey
    }

    return `layout.panel-${type}.${panelKey}` satisfies SettingsEntryKey
  }

  return {
    addElementToPanel,
    elementDragging,
    getPanelElements,
    getPanelSize,
    handlePanelSizeChange,
    removeElementFromPanel,
  }
}
