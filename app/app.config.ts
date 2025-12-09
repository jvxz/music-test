export default defineAppConfig({
  app: {
    author: 'jvxz',
    name: 'swim',
    repo: 'https://github.com/jvxz/swim',
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
