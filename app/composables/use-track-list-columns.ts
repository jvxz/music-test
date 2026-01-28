import { getAllWebviewWindows } from '@tauri-apps/api/webviewWindow'

export const useTrackListColumns = createSharedComposable(() => {
  const { layoutPanels } = usePersistentPanels('track-list-columns', [
    3,
    1.5,
    34.0888869203,
    15.1599593363,
    15.0211805522,
    8.5755556775,
    14.3210841804,
    8.3333333333,
  ])

  const { execute: createSetDisplayedFieldsWindow, state: setDisplayedFieldsWindow } = useAsyncState(async () => createTauriWindow('track-list-columns', {
    center: true,
    height: 800,
    resizable: false,
    title: 'Set displayed fields',
    url: '/set-displayed-fields',
    width: 600,
  }), null, { immediate: false })

  async function openSetDisplayedFieldsWindow() {
    const webviews = await getAllWebviewWindows()
    const targetWebview = webviews.find(w => w.label === 'track-list-columns')

    if (targetWebview) {
      targetWebview.setFocus()
      return
    }

    if (setDisplayedFieldsWindow.value) {
      setDisplayedFieldsWindow.value.setFocus()
      return
    }

    createSetDisplayedFieldsWindow()
  }

  return {
    layoutPanels,
    openSetDisplayedFieldsWindow,
    setDisplayedFieldsWindow,
  }
})
