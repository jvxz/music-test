type SettingsEntryKeyFormat = `${typeof SETTINGS_MODAL_TABS[number]}.${string}`

export interface Settings {
  'appearance.font.name': 'SYSTEM' | (string & {})
  'appearance.font.weight': string
  'appearance.font.variant': string
  'general.click-outside-to-deselect': boolean
  'last-fm.username': string | null
  'last-fm.do-scrobbling': boolean
  'last-fm.do-now-playing-updates': boolean
  'last-fm.do-offline-scrobbling': boolean
  'appearance.token.background': string
  'appearance.token.muted': string
  'appearance.token.foreground': string
  'appearance.token.primary': string
  'appearance.token.border': string
  'appearance.token.surface': string
  'appearance.presets': Record<string, Record<SettingsEntryKey & `appearance.token.${string}`, string>>
  'track-list.row-style': 'alternating-background' | 'bordered' | 'none'
}

export type SettingsEntryKey = keyof Settings
export type SettingsEntryValue<T extends SettingsEntryKey> = Settings[T]

type EnforcedSettingsKeys<T extends Record<string, any>> = {
  [K in keyof T]: K extends SettingsEntryKeyFormat ? T[K] : never
}

export const DEFAULT_SETTINGS: EnforcedSettingsKeys<Settings> = {
  'appearance.font.name': 'SYSTEM',
  'appearance.font.variant': 'Normal',
  'appearance.font.weight': '400',
  'appearance.presets': {
    Default: {
      'appearance.token.background': '#080808',
      'appearance.token.border': '#171717',
      'appearance.token.foreground': '#C7C7C7',
      'appearance.token.muted': '#1D1D1D',
      'appearance.token.primary': '#5A907C',
      'appearance.token.surface': '#0E0E0E',
    },
  },
  'appearance.token.background': '#080808',
  'appearance.token.border': '#171717',
  'appearance.token.foreground': '#C7C7C7',
  'appearance.token.muted': '#1D1D1D',
  'appearance.token.primary': '#5A907C',
  'appearance.token.surface': '#0E0E0E',
  'general.click-outside-to-deselect': true,
  'last-fm.do-now-playing-updates': true,
  'last-fm.do-offline-scrobbling': true,
  'last-fm.do-scrobbling': true,
  'last-fm.username': null,
  'track-list.row-style': 'bordered',
}

export const useSettings = createSharedComposable(() => {
  const settings = useState<Settings>('settings')

  function getSettingValue<T extends SettingsEntryKey>(key: T): SettingsEntryValue<T> {
    return settings.value[key]
  }

  function getSettingValueRef<T extends SettingsEntryKey>(
    key: T,
    opts?: {
      onChanged?: (value: SettingsEntryValue<T>, oldValue: SettingsEntryValue<T>) => void
      onBeforeChange?: (value: SettingsEntryValue<T>) => boolean
    },
  ): Ref<SettingsEntryValue<T>> {
    return computed({
      get: () => settings.value[key],
      set: (value) => {
        if (opts?.onBeforeChange && !opts?.onBeforeChange?.(value))
          return
        settings.value = { ...settings.value, [key]: value }
        opts?.onChanged?.(value, settings.value[key])
      },
    })
  }

  function setSettingValue<T extends SettingsEntryKey>(key: T, value: SettingsEntryValue<T>) {
    settings.value = { ...settings.value, [key]: value }
  }

  function setSettingValues<T extends Record<SettingsEntryKey, SettingsEntryValue<SettingsEntryKey>>>(values: T) {
    settings.value = { ...settings.value, ...values }
  }

  return {
    getSettingValue,
    getSettingValueRef,
    setSettingValue,
    setSettingValues,
    settings,
  }
})
