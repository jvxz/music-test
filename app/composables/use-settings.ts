import { createStore } from '@tauri-store/vue'

type SettingsEntryKeyFormat = `${typeof SETTINGS_MODAL_TABS[number]}`

export interface Settings {
  appearance: {
    font: {
      name: 'SYSTEM' | (string & {})
      weight: string
      variant: string
    }
    token: {
      background: string
      muted: string
      foreground: string
      primary: string
      border: string
      surface: string
    }
    presets: Record<string, Record<keyof Settings['appearance']['token'], string>>
  }
  // 'appearance.token.background': string
  // 'appearance.token.muted': string
  // 'appearance.token.foreground': string
  // 'appearance.token.primary': string
  // 'appearance.token.border': string
  // 'appearance.token.surface': string
  // 'appearance.presets': Record<string, Record<SettingsEntryKey & `appearance.token.${string}`, string>>
  // 'appearance.font.name': 'SYSTEM' | (string & {})
  // 'appearance.font.weight': string
  // 'appearance.font.variant': string
  general: {
    clickOutsideToDeselect: boolean
  }
  // 'general.click-outside-to-deselect': boolean
  lastFm: {
    username: string | null
    doScrobbling: boolean
    doNowPlayingUpdates: boolean
    doOfflineScrobbling: boolean
  }
  // 'last-fm.username': string | null
  // 'last-fm.do-scrobbling': boolean
  // 'last-fm.do-now-playing-updates': boolean
  // 'last-fm.do-offline-scrobbling': boolean

  layout: {
    allowResizing: boolean
    panel: {
      bottom: LayoutPanelSetting<'bottom'>
      left: LayoutPanelSetting<'left'>
      main: LayoutPanelSetting<'main'>
      right: LayoutPanelSetting<'right'>
      top: LayoutPanelSetting<'top'>
    }
    panelSizes: {
      bottom: number
      left: number
      main: number
      right: number
      top: number
    }
    panelElementSizes: {
      bottom: number[]
      left: number[]
      main: number[]
      right: number[]
      top: number[]
    }
    element: {
      player: LayoutElementSetting<'player'>
      trackList: LayoutElementSetting<'track-list'>
      libraryView: LayoutElementSetting<'library-view'>
      metadataView: LayoutElementSetting<'metadata-view'>
      coverArt: LayoutElementSetting<'cover-art'>
    }
  }
  // 'layout.allow-resizing': boolean
  // 'layout.panel.bottom': LayoutPanelSetting<'bottom'>
  // 'layout.panel.left': LayoutPanelSetting<'left'>
  // 'layout.panel.main': LayoutPanelSetting<'main'>
  // 'layout.panel.right': LayoutPanelSetting<'right'>
  // 'layout.panel.top': LayoutPanelSetting<'top'>
  // 'layout.panel-size.bottom': number
  // 'layout.panel-size.left': number
  // 'layout.panel-size.main': number
  // 'layout.panel-size.right': number
  // 'layout.panel-size.top': number
  // 'layout.panel-element-sizes.bottom': number[]
  // 'layout.panel-element-sizes.left': number[]
  // 'layout.panel-element-sizes.main': number[]
  // 'layout.panel-element-sizes.right': number[]
  // 'layout.panel-element-sizes.top': number[]
  // 'layout.element.player': LayoutElementSetting<'player'>
  // 'layout.element.track-list': LayoutElementSetting<'track-list'>
  // 'layout.element.library-view': LayoutElementSetting<'library-view'>
  // 'layout.element.metadata-view': LayoutElementSetting<'metadata-view'>
  // 'layout.element.cover-art': LayoutElementSetting<'cover-art'>
}

export type SettingsEntryKey = keyof Settings
export type SettingsEntryValue<T extends SettingsEntryKey> = Settings[T]

type EnforcedSettingsKeys<T extends Record<string, any>> = {
  [K in keyof T]: K extends SettingsEntryKeyFormat ? T[K] : never
}

export const DEFAULT_SETTINGS: EnforcedSettingsKeys<Settings> = {
  appearance: {
    font: {
      name: 'SYSTEM',
      variant: 'Normal',
      weight: '400',
    },
    presets: {
      Default: {
        background: '#080808',
        border: '#171717',
        foreground: '#C7C7C7',
        muted: '#1D1D1D',
        primary: '#5A907C',
        surface: '#0E0E0E',
      },
    },
    token: {
      background: '#080808',
      border: '#171717',
      foreground: '#C7C7C7',
      muted: '#1D1D1D',
      primary: '#5A907C',
      surface: '#0E0E0E',
    },
  },
  general: {
    clickOutsideToDeselect: true,
  },
  lastFm: {
    doNowPlayingUpdates: true,
    doOfflineScrobbling: true,
    doScrobbling: true,
    username: null,
  },
  layout: {
    allowResizing: true,
    element: {
      coverArt: defaultLayoutElementSettings['cover-art'],
      libraryView: defaultLayoutElementSettings['library-view'],
      metadataView: defaultLayoutElementSettings['metadata-view'],
      player: defaultLayoutElementSettings.player,
      trackList: defaultLayoutElementSettings['track-list'],
    },
    panel: {
      bottom: ['player'],
      left: ['library-view'],
      main: ['track-list'],
      right: ['cover-art'],
      top: [],
    },
    panelElementSizes: {
      bottom: [100],
      left: [100],
      main: [100],
      right: [100],
      top: [100],
    },
    panelSizes: {
      bottom: 12.5,
      left: 35,
      main: 12.5,
      right: 12.5,
      top: 12.5,
    },
  },
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
