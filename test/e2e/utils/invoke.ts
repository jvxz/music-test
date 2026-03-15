export async function $invoke<T>(cmd: string, args: any[]): Promise<T | null> {
  return browser.execute(
    async (...args) => {
      try {
        return await window.__TAURI_INVOKE__<T>(cmd, {
          ...args,
        })
      }
      catch (error) {
        console.error('error invoking command: ', cmd, 'with args: ', args, '... ', error)

        return null
      }
    },
    ...args,
  )
}
