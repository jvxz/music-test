import type { WebviewLabel, WebviewOptions } from '@tauri-apps/api/webview'
import type { WindowOptions } from '@tauri-apps/api/window'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

export function createTauriWindow(label: WebviewLabel, options?: Omit<WebviewOptions, 'x' | 'y' | 'width' | 'height'> & WindowOptions) {
  const { getSettingValue } = useSettings()
  const backgroundColor = getSettingValue('appearance.token.background')

  const w = new WebviewWindow(label, {
    ...options,
    backgroundColor,
    center: true,
    decorations: true,
    titleBarStyle: 'overlay',
    visible: false,
  })

  return w
}
