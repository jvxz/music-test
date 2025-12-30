type SettingsEntryKeyFormat = `${typeof SETTINGS_MODAL_TABS[number]}.${string}`

export interface Settings {
  'appearance.font': 'SYSTEM' | (string & {})
}

export type SettingsEntryKey = keyof Settings
export type SettingsEntryValue<T extends SettingsEntryKey> = Settings[T]

type EnforcedSettingsKeys<T extends Record<string, any>> = {
  [K in keyof T]: K extends SettingsEntryKeyFormat ? T[K] : never
}

export const DEFAULT_SETTINGS: EnforcedSettingsKeys<Settings> = {
  'appearance.font': 'SYSTEM',
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
  return {
    getSettingValue,
    getSettingValueRef,
    settings,
  }
})
