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

  layout: {
    allowResizing: boolean
    // panel: Record<LayoutPanelKey, LayoutPanelSetting>
    // panelSizes: {
    //   bottom: number
    //   left: number
    //   main: number
    //   right: number
    //   top: number
    // }
    // panelElementSizes: {
    //   bottom: number[]
    //   left: number[]
    //   main: number[]
    //   right: number[]
    //   top: number[]
    // }
    panel: Record<LayoutPanelKey, LayoutPanelSetting>
    element: LayoutElementSettings
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
  // 'layout.element.libraryView': LayoutElementSetting<'libraryView'>
  // 'layout.element.metadataView': LayoutElementSetting<'metadataView'>
  // 'layout.element.coverArt': LayoutElementSetting<'coverArt'>
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
      coverArt: defaultLayoutElementSettings.coverArt,
      libraryView: defaultLayoutElementSettings.libraryView,
      metadataView: defaultLayoutElementSettings.metadataView,
      player: defaultLayoutElementSettings.player,
      trackList: defaultLayoutElementSettings.trackList,
    },
    panel: {
      bottom: {
        elements: ['player'],
        elementSizes: [100],
        size: 12.5,
      },
      left: {
        elements: ['libraryView'],
        elementSizes: [100],
        size: 35,
      },
      main: {
        elements: ['trackList'],
        elementSizes: [100],
        size: 12.5,
      },
      right: {
        elements: ['coverArt'],
        elementSizes: [100],
        size: 35,
      },
      top: {
        elements: [],
        elementSizes: [],
        size: 12.5,
      },
    },
    // element: {
    // coverArt: defaultLayoutElementSettings.coverArt,
    //   libraryView: defaultLayoutElementSettings.libraryView,
    //   metadataView: defaultLayoutElementSettings.metadataView,
    //   player: defaultLayoutElementSettings.player,
    //   trackList: defaultLayoutElementSettings.trackList,
    // },
    // panelElements: {
    //   bottom: ['player'],
    //   left: ['libraryView'],
    //   main: ['trackList'],
    //   right: ['coverArt'],
    //   top: [],
    // },
    // panelElementSizes: {
    //   bottom: [100],
    //   left: [100],
    //   main: [100],
    //   right: [100],
    //   top: [100],
    // },
    // panelSizes: {
    //   bottom: 12.5,
    //   left: 35,
    //   main: 12.5,
    //   right: 12.5,
    //   top: 12.5,
    // },
  },
}

export const useSettings = defineStore('settings', () => reactive(DEFAULT_SETTINGS), {
  tauri: {
    saveInterval: 500,
    saveOnChange: true,
    saveOnExit: true,
    saveStrategy: 'debounce',
    sync: false,
    syncInterval: 100,
    syncStrategy: 'debounce',
  },

})
