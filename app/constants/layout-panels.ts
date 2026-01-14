export const layoutPanelElements = [{
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
  key: 'playlist-view',
  label: 'Playlist view',
}] as const

export const layoutPanelElementNames = layoutPanelElements.map(element => element.key)

export const layoutPanelNames = ['bottom', 'left', 'main', 'right', 'top'] as const

export const layoutPanels = {
  bottom: {
    allowedElements: [
      'playlist-view',
      'player',
    ],
    class: 'h-1/3 mt-auto w-full bg-muted/25 border-t',
    label: 'Bottom panel',
  },
  left: {
    allowedElements: [
      'library-view',
      'metadata-view',
    ],
    class: 'h-full bg-muted/25 w-1/4 border-r',
    label: 'Left panel',
  },
  main: {
    allowedElements: [
      'playlist-view',
    ],
    class: 'w-1/2 bg-muted/25 mx-auto h-full border-x',
    label: 'Main panel',
  },
  right: {
    allowedElements: [
      'cover-art',
      'metadata-view',
      'library-view',
    ],
    class: 'h-full bg-muted/25 ml-auto w-1/4 border-l',
    label: 'Right panel',
  },
  top: {
    allowedElements: [
      'playlist-view',
      'player',
    ],
    class: 'h-1/3 w-full bg-muted/25 border-b',
    label: 'Top panel',
  },
} satisfies Record<LayoutPanelKey, {
  allowedElements: LayoutElementKey[]
  class: string
  label: string
}>

export type LayoutElementKey = (typeof layoutPanelElements)[number]['key']
export type LayoutPanelKey = (typeof layoutPanelNames)[number]

export type LayoutPanelElementsSetting<T extends LayoutPanelKey> = (typeof layoutPanels)[T]['allowedElements']
