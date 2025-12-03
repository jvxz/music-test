export const useLayoutPanels = createSharedComposable(() => {
  const { $tauri } = useNuxtApp()
  const layoutPanels = ref<number[]>($tauri.store._loaded.layoutPanels)

  watchDebounced(layoutPanels, () => {
    storeLayoutPanelsState(layoutPanels.value)
  }, {
    debounce: 500,
  })

  function storeLayoutPanelsState(panels: number[]) {
    $tauri.store.prefs.set('layout-panels', panels)
  }

  return {
    layoutPanels,
  }
})
