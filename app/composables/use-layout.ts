export function useLayout() {
  const { getSettingValue, getSettingValueRef, setSettingValue } = useSettings()

  const elementDragging = useState<LayoutElementKey | null>('layout-element-dragging', () => null)

  function addElementToPanel(panelKey: LayoutPanelKey, elementKey: LayoutElementKey) {
    const settingKey = getPanelSettingKey(panelKey, 'elements')
    const settingValue = getSettingValue(settingKey)

    // type assertion because unable to add to array of unknown types
    setSettingValue(settingKey, [...settingValue, elementKey] as LayoutPanelSetting<typeof panelKey>)
  }

  function removeElementFromPanel(panelKey: LayoutPanelKey, elementKey: LayoutElementKey) {
    const settingKey = getPanelSettingKey(panelKey, 'elements')
    const settingValue = getSettingValue(settingKey)

    // type assertion because unable to filter array of unknown types
    setSettingValue(settingKey, settingValue.filter(value => value !== elementKey) as LayoutPanelSetting<typeof panelKey>)
  }

  function getPanelElements<T extends LayoutPanelKey>(panelKey: T): Ref<LayoutPanelSetting<T>> {
    const settingKey = getPanelSettingKey(panelKey, 'elements')

    return getSettingValueRef(settingKey)
  }

  function getElementSettings<T extends LayoutElementKey>(elementKey: T): Ref<LayoutElementSetting<T>> {
    const settingKey = getElementSettingKey(elementKey)

    // type assertion because unable to get value of unknown type
    return getSettingValueRef(settingKey) as Ref<LayoutElementSetting<T>>
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
      const key = `layout.panel.${panelKey}` satisfies SettingsEntryKey
      if (!key.startsWith('layout.panel.')) {
        throw new Error(`Attempted to get panel elements for invalid panel key: ${key}`)
      }

      return key
    }

    const key = `layout.panel-${type}.${panelKey}` satisfies SettingsEntryKey
    if (!key.startsWith(`layout.panel-${type}.`)) {
      throw new Error(`Attempted to get panel ${type} for invalid panel key: ${key}`)
    }

    return key
  }

  function getElementSettingKey(elementKey: LayoutElementKey): `layout.element.${LayoutElementKey}` {
    return `layout.element.${elementKey}` satisfies SettingsEntryKey
  }

  return {
    addElementToPanel,
    elementDragging,
    getElementSettings,
    getPanelElements,
    getPanelSize,
    handlePanelSizeChange,
    removeElementFromPanel,
  }
}
