import { getCapabilities } from '../../../wdio.conf'

describe('tauri startup behavior', () => {
  it('successfully starts the app 20 times', async () => {
    const capabilities = getCapabilities()
    for (let i = 0; i < 20; i++) {
      if (i > 0) {
        await browser.deleteSession()
        await browser.newSession(capabilities[0])
      }
      await browser.waitUntil(
        async () => (await browser.execute(() => typeof window.__TAURI_INVOKE__ === 'function')) === true,
        { interval: 100, timeout: 10000 },
      )
    }
  })
})
