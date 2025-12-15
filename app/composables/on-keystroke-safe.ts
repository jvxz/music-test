import type { UseMagicKeysOptions } from '@vueuse/core'
import type { ShallowRef } from 'vue'

interface Options extends UseMagicKeysOptions<false> {
  /**
   * The active element to check if the keystroke is being used in an input or textarea
   *
   * If not provided, the active element will be detected automatically
   */
  activeElement?: ShallowRef<HTMLElement | null | undefined, HTMLElement | null | undefined>
}

export function onKeyStrokeSafe(keystroke: string, callback: () => void, options?: Options) {
  const keys = useMagicKeys(options)
  const activeElement = options?.activeElement ?? useActiveElement()

  whenever(() => keys[keystroke]?.value, () => {
    const isInInput = activeElement.value?.tagName.toLowerCase() === 'input' || activeElement.value?.tagName.toLowerCase() === 'textarea'

    if (isInInput)
      return

    callback()
  })
}
