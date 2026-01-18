export function useLayout() {
  const { getSettingValue, getSettingValueRef, setSettingValue, settings } = useSettings()

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

  const getAllPanelElements = () => computedWithControl(settings, () => ({
    bottom: getSettingValue('layout.panel.bottom'),
    left: getSettingValue('layout.panel.left'),
    main: getSettingValue('layout.panel.main'),
    right: getSettingValue('layout.panel.right'),
    top: getSettingValue('layout.panel.top'),
  }))

  function getPanelElementSizes<T extends LayoutPanelKey>(panelKey: T): Ref<number[]> {
    const settingKey = getPanelSettingKey(panelKey, 'element-sizes')
    return getSettingValueRef(settingKey)
  }

  const handlePanelSizeChange = useDebounceFn((panelKeyOrder: LayoutPanelKey[], sizes: number[]) => {
    for (const [index, panelKey] of panelKeyOrder.entries()) {
      if (!getPanelElements(panelKey).value.length)
        continue

      if (sizes[index] === undefined) {
        console.error(`Panel ${panelKey} size is undefined`)
        continue
      }

      const settingKey = getPanelSettingKey(panelKey, 'size')

      setSettingValue(settingKey, sizes[index])
    }
  }, 200)

  const handlePanelElementsSizeChange = useDebounceFn((panelKey: LayoutPanelKey, sizes: number[]) => {
    const settingKey = getPanelSettingKey(panelKey, 'element-sizes')

    setSettingValue(settingKey, sizes)
  }, 200)

  function getPanelSettingKey(panelKey: LayoutPanelKey, type: 'elements'): `layout.panel.${LayoutPanelKey}`
  function getPanelSettingKey(panelKey: LayoutPanelKey, type: 'size'): `layout.panel-size.${LayoutPanelKey}`
  function getPanelSettingKey(panelKey: LayoutPanelKey, type: 'element-sizes'): `layout.panel-element-sizes.${LayoutPanelKey}`
  function getPanelSettingKey(panelKey: LayoutPanelKey, type = 'elements' as 'elements' | 'size' | 'element-sizes') {
    if (type === 'elements') {
      const key = `layout.panel.${panelKey}` satisfies SettingsEntryKey
      if (!key.startsWith('layout.panel.')) {
        throw new Error(`Attempted to get panel elements for invalid panel key: ${key}`)
      }

      return key
    }

    if (type === 'element-sizes') {
      const key = `layout.panel-element-sizes.${panelKey}` satisfies SettingsEntryKey
      if (!key.startsWith('layout.panel-element-sizes.')) {
        throw new Error(`Attempted to get panel element sizes for invalid panel key: ${key}`)
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
    getAllPanelElements,
    getElementSettings,
    getPanelElements,
    getPanelElementSizes,
    getPanelSize,
    handlePanelElementsSizeChange,
    handlePanelSizeChange,
    removeElementFromPanel,
  }
}
