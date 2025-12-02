export default defineAppConfig({
  app: {
    author: 'Nicola Spadari',
    name: 'Nuxtor',
    nuxtSite: 'https://nuxt.com',
    nuxtUiSite: 'https://ui4.nuxt.dev',
    repo: 'https://github.com/NicolaSpadari/nuxtor',
    tauriSite: 'https://tauri.app',
  },
  pageCategories: {
    interface: {
      icon: 'lucide:app-window-mac',
      label: 'Interface',
    },
    other: {
      icon: 'lucide:folder',
      label: 'Other',
    },
    storage: {
      icon: 'lucide:archive',
      label: 'Storage',
    },
    system: {
      icon: 'lucide:square-terminal',
      label: 'System',
    },
  },
})
