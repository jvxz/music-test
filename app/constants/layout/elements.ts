interface LayoutElement {
  key: LayoutElementKey
  label: string
}

export const layoutPanelElementKeys = ['cover-art', 'library-view', 'metadata-view', 'player', 'track-list'] as const

export const layoutPanelElements: LayoutElement[] = [{
  key: 'cover-art',
  label: 'Cover art',
}, {
  key: 'library-view',
  label: 'Library view',
}, {
  key: 'metadata-view',
  label: 'Metadata view',
}, {
  key: 'player',
  label: 'Player',
}, {
  key: 'track-list',
  label: 'Track list',
}]

interface LayoutElementSettings extends Record<LayoutElementKey, unknown> {
  'library-view': {
    showFolders: boolean
  }
  'metadata-view': {
    frames: string[]
  }
  'player': {
    seekBarThickness: number
    seekBarThumbShape: 'line' | 'circle'
    showTrackCover: boolean
    roundTrackCover: boolean
  }
  'track-list': {
    rowStyle: 'bordered' | 'alternating' | 'none'
  }
  'cover-art': unknown
}

export const defaultLayoutElementSettings = {
  'cover-art': {},
  'library-view': {
    showFolders: true,
  },
  'metadata-view': {
    frames: ['TIT2', 'TPE1', 'TALB', 'TPE2'],
  },
  'player': {
    roundTrackCover: true,
    seekBarThickness: 2,
    seekBarThumbShape: 'circle' as 'line' | 'circle',
    showTrackCover: true,
  },
  'track-list': {
    rowStyle: 'bordered',
  },
} satisfies LayoutElementSettings

export type LayoutElementKey = (typeof layoutPanelElementKeys)[number]

export type LayoutElementSetting<T extends LayoutElementKey> = LayoutElementSettings[T]
