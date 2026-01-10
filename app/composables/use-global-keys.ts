import type { UseMagicKeysOptions } from '@vueuse/core'

const windowsAliasMap: Record<string, string> = {
  ctrl: 'control',
  meta: 'command',
}

const macosAliasMap: Record<string, string> = {
  command: 'control',
  control: 'meta',
  ctrl: 'meta',
  option: 'alt',
}

export const useGlobalKeys = createSharedComposable((opts?: UseMagicKeysOptions<false>) => {
  const os = useTauriOsPlatform()

  const aliasMap = os === 'macos' ? macosAliasMap : windowsAliasMap

  return useMagicKeys({
    ...opts,
    aliasMap: {
      ...aliasMap,
      ...opts?.aliasMap,
    },
  })
})
