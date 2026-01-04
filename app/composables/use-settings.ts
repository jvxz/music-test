type SettingsEntryKeyFormat = `${typeof SETTINGS_MODAL_TABS[number]}.${string}`

export interface Settings {
  'appearance.font': 'SYSTEM' | (string & {})
  'last-fm.username': string | null
  'last-fm.do-scrobbling': boolean
  'last-fm.do-now-playing-updates': boolean
  'last-fm.do-offline-scrobbling': boolean
}

export type SettingsEntryKey = keyof Settings
export type SettingsEntryValue<T extends SettingsEntryKey> = Settings[T]

type EnforcedSettingsKeys<T extends Record<string, any>> = {
  [K in keyof T]: K extends SettingsEntryKeyFormat ? T[K] : never
}

export const DEFAULT_SETTINGS: EnforcedSettingsKeys<Settings> = {
  'appearance.font': 'SYSTEM',
  'last-fm.do-now-playing-updates': true,
  'last-fm.do-offline-scrobbling': true,
  'last-fm.do-scrobbling': true,
  'last-fm.username': null,
}

export const useSettings = createSharedComposable(() => {
  const settings = useState<Settings>('settings')

  function getSettingValue<T extends SettingsEntryKey>(key: T): SettingsEntryValue<T> {
    return settings.value[key]
  }

  function getSettingValueRef<T extends SettingsEntryKey>(key: T): Ref<SettingsEntryValue<T>> {
    const ref = refWithControl(settings.value[key], {
      onChanged: value => settings.value = { ...settings.value, [key]: value },
    })
    return ref
  }

  function setSettingValue<T extends SettingsEntryKey>(key: T, value: SettingsEntryValue<T>) {
    settings.value = { ...settings.value, [key]: value }
  }

  return {
    getSettingValue,
    getSettingValueRef,
    setSettingValue,
    settings,
  }
})
