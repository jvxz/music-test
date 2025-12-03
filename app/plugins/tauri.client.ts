export default defineNuxtPlugin(async () => {
  const tauriPrefs = await useTauriStoreLoad('prefs.json', {
    autoSave: true,
    defaults: {
      'layout-panels': [12.5, 50, 12.5],
    },
  })

  // prerequisites (needed for fcp)
  const layoutPanels = await tauriPrefs.get<number[]>('layout-panels') ?? [12.5, 50, 12.5]

  return {
    provide: {
      tauri: {
        store: {
          _loaded: {
            layoutPanels,
          },
          prefs: tauriPrefs,
        },
      },
    },
  }
})
