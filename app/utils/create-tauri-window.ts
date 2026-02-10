import type { WebviewLabel, WebviewOptions } from '@tauri-apps/api/webview'
import type { WindowOptions } from '@tauri-apps/api/window'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

type Options = Omit<WebviewOptions, 'x' | 'y' | 'width' | 'height'> & WindowOptions & {
  url: string
}

export function createTauriWindow(label: WebviewLabel, options: Options) {
  const settings = useSettings()

  const w = new WebviewWindow(label, {
    ...options,
    backgroundColor: settings.appearance.token.background,
    center: true,
    decorations: true,
    titleBarStyle: 'overlay',
    visible: false,
  })

  return w
}
