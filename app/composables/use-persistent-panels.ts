export function usePersistentPanels(key: string, defaultPanels: number[]) {
  const { $tauri } = useNuxtApp()
  const layoutPanels = ref<number[]>($tauri.prefs.get(`panels:${key}`) as number[] ?? defaultPanels)

  watchDebounced(layoutPanels, () => {
    storeLayoutPanelsState(layoutPanels.value)
  }, {
    debounce: 500,
  })

  async function storeLayoutPanelsState(panels: number[]) {
    await $tauri.store.set(`panels:${key}`, panels)
  }

  return {
    layoutPanels,
  }
}
