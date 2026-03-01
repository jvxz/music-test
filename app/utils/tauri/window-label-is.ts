import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'

/* check if the current window label is the same as the given label */
export function windowLabelIs(label: string) {
  return getCurrentWebviewWindow().label === label
}
