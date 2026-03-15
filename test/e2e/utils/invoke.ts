export async function $invoke<T>(cmd: string, payload: Record<string, unknown>): Promise<T | null> {
  return browser.execute(
    async (command: string, args: Record<string, unknown>) => {
      try {
        return await window.__TAURI_INVOKE__(command, args)
      }
      catch (error: any) {
        return error
      }
    },
    cmd,
    payload,
  )
}
