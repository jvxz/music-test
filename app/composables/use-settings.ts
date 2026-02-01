import { createStore } from '@tauri-store/vue'

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
  'layout.allow-resizing': boolean
  'layout.panel.bottom': LayoutPanelSetting<'bottom'>
  'layout.panel.left': LayoutPanelSetting<'left'>
  'layout.panel.main': LayoutPanelSetting<'main'>
  'layout.panel.right': LayoutPanelSetting<'right'>
  'layout.panel.top': LayoutPanelSetting<'top'>
  'layout.panel-size.bottom': number
  'layout.panel-size.left': number
  'layout.panel-size.main': number
  'layout.panel-size.right': number
  'layout.panel-size.top': number
  'layout.panel-element-sizes.bottom': number[]
  'layout.panel-element-sizes.left': number[]
  'layout.panel-element-sizes.main': number[]
  'layout.panel-element-sizes.right': number[]
  'layout.panel-element-sizes.top': number[]
  'layout.element.player': LayoutElementSetting<'player'>
  'layout.element.track-list': LayoutElementSetting<'track-list'>
  'layout.element.library-view': LayoutElementSetting<'library-view'>
  'layout.element.metadata-view': LayoutElementSetting<'metadata-view'>
  'layout.element.cover-art': LayoutElementSetting<'cover-art'>
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
  'layout.allow-resizing': true,
  'layout.element.cover-art': defaultLayoutElementSettings['cover-art'],
  'layout.element.library-view': defaultLayoutElementSettings['library-view'],
  'layout.element.metadata-view': defaultLayoutElementSettings['metadata-view'],
  'layout.element.player': defaultLayoutElementSettings.player,
  'layout.element.track-list': defaultLayoutElementSettings['track-list'],
  'layout.panel-element-sizes.bottom': [100],
  'layout.panel-element-sizes.left': [100],
  'layout.panel-element-sizes.main': [100],
  'layout.panel-element-sizes.right': [100],
  'layout.panel-element-sizes.top': [100],
  'layout.panel-size.bottom': 12.5,
  'layout.panel-size.left': 35,
  'layout.panel-size.main': 12.5,
  'layout.panel-size.right': 12.5,
  'layout.panel-size.top': 12.5,
  'layout.panel.bottom': ['player'],
  'layout.panel.left': ['library-view'],
  'layout.panel.main': ['track-list'],
  'layout.panel.right': ['cover-art'],
  'layout.panel.top': [],
}

export function useSettingsData() {
  return createStore('settings', DEFAULT_SETTINGS, {
    save: true,
    saveInterval: 300,
    saveOnChange: true,
    saveStrategy: 'debounce',
    sync: true,
  })
}

export const useSettings = createSharedComposable(() => {
  const settings = useSettingsData()

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
