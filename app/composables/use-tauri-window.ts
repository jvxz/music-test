import type { WebviewOptions } from '@tauri-apps/api/webview'
import type { WindowOptions } from '@tauri-apps/api/window'
import { getAllWebviewWindows, WebviewWindow } from '@tauri-apps/api/webviewWindow'

export function useTauriWindow(label: string, options?: Omit<WebviewOptions, 'x' | 'y' | 'width' | 'height'> & WindowOptions) {
  const settings = useSettings()

  const { execute: _createWindow, state: window, ...rest } = useAsyncState(async () => new WebviewWindow(label, $defu(
    options,
    {
      backgroundColor: settings.appearance.token.background,
      center: true,
      decorations: true,
      titleBarStyle: 'overlay' as const,
      visible: false,
    },
  )), null, { immediate: false })

  async function createWindow() {
    const webviews = await getAllWebviewWindows()
    const targetWebview = webviews.find(w => w.label === label)

    if (targetWebview) {
      targetWebview.setFocus()
      return
    }

    await _createWindow()
  }

  return {
    createWindow,
    window,
    ...rest,
  }
}
