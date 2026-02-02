export function useLayout() {
  const settings = useSettings()

  const elementDraggingData = useState<{
    from: LayoutPanelKey | 'AVAILABLE_ELEMENTS'
    element: LayoutElementKey
  } | null>('layout-element-dragging-data', () => null)

  const elementSettingsToShow = useState<LayoutElementKey | undefined>('layout-element-settings-to-show', () => undefined)

  function addElementToPanel(panelKey: LayoutPanelKey, elementKey: LayoutElementKey) {
    settings.layout.panel[panelKey].elements.push(elementKey)
  }

  function removeElementFromPanel<T extends LayoutPanelKey>(panelKey: T, elementKey: LayoutPanelElements<T>) {
    const panel = settings.layout.panel[panelKey]
    panel.elements = panel.elements.filter(k => k !== elementKey)
  }

  function getPanelElements<T extends LayoutPanelKey>(panelKey: T) {
    return settings.layout.panel[panelKey].elements
  }

  function getElementSettings<T extends LayoutElementKey>(elementKey: T) {
    return settings.layout.element[elementKey]
  }

  function getPanelSize<T extends LayoutPanelKey>(panelKey: T) {
    return settings.layout.panel[panelKey].size
  }

  const getAllPanelElements = () => settings.layout.element

  function getPanelElementSizes<T extends LayoutPanelKey>(panelKey: T) {
    return settings.layout.panel[panelKey].elementSizes
  }

  const handlePanelSizeChange = useDebounceFn((panelKeyOrder: LayoutPanelKey[], sizes: number[]) => {
    for (const [index, panelKey] of panelKeyOrder.entries()) {
      if (!getPanelElements(panelKey).length)
        continue

      if (sizes[index] === undefined) {
        console.error(`Panel ${panelKey} size is undefined`)
        continue
      }

      settings.layout.panel[panelKey].size = sizes[index]
    }
  }, 200)

  const handlePanelElementsSizeChange = useDebounceFn((panelKey: LayoutPanelKey, sizes: number[]) => {
    settings.layout.panel[panelKey].elementSizes = sizes
  }, 200)

  function isElementAllowedInPanel(panelKey: LayoutPanelKey, elementKey: LayoutElementKey): boolean {
    const allowedElements = layoutPanels[panelKey].allowedElements as readonly LayoutElementKey[]
    const existingElements = getPanelElements(panelKey)

    return allowedElements.includes(elementKey) && !existingElements.includes(elementKey)
  }

  return {
    addElementToPanel,
    elementDraggingData,
    elementSettingsToShow,
    getAllPanelElements,
    getElementSettings,
    getPanelElements,
    getPanelElementSizes,
    getPanelSize,
    handlePanelElementsSizeChange,
    handlePanelSizeChange,
    isElementAllowedInPanel,
    removeElementFromPanel,
  }
}
