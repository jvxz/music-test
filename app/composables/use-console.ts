import type { Error } from '~/types/tauri-bindings'

export interface ConsoleMessage {
  timestamp: number
  text: string
  type?: 'log' | 'error' | 'warn'
  source?: Error['type']
}

export const useConsole = defineStore('console', () => {
  const consoleMessages = shallowRef<ConsoleMessage[]>([])

  function emitMessage(message: Omit<ConsoleMessage, 'timestamp'>) {
    consoleMessages.value = [...consoleMessages.value, { ...message, timestamp: Date.now() }]
    // eslint-disable-next-line no-console
    console[message.type ?? 'log'](message.text)
  }

  return {
    consoleMessages,
    emitMessage,
  }
})
