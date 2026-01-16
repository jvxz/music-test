/* eslint-disable perfectionist/sort-objects */
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

export const layoutPanelNames = ['top', 'left', 'main', 'right', 'bottom'] as const

export const layoutPanels = {
  top: {
    allowedElements: [
      'playlist-view',
      'player',
    ],
    class: 'h-1/3 w-full bg-muted/25 border-b',
    key: 'top',
    label: 'Top panel',
  },
  left: {
    allowedElements: [
      'library-view',
      'metadata-view',
      'cover-art',
    ],
    class: 'h-full bg-muted/25 w-1/4 border-r',
    key: 'left',
    label: 'Left panel',
  },
  main: {
    allowedElements: [
      'playlist-view',
    ],
    class: 'w-1/2 bg-muted/25 mx-auto h-full border-x',
    key: 'main',
    label: 'Main panel',
  },
  right: {
    allowedElements: [
      'cover-art',
      'metadata-view',
      'library-view',
    ],
    class: 'h-full bg-muted/25 ml-auto w-1/4 border-l',
    key: 'right',
    label: 'Right panel',
  },
  bottom: {
    allowedElements: [
      'playlist-view',
      'player',
      'cover-art',
    ],
    class: 'h-1/3 mt-auto w-full bg-muted/25 border-t',
    key: 'bottom',
    label: 'Bottom panel',
  },
} satisfies Record<LayoutPanelKey, {
  allowedElements: LayoutElementKey[]
  key: LayoutPanelKey
  class: string
  label: string
}>

export type LayoutPanel = (typeof layoutPanels)[LayoutPanelKey]
export type LayoutPanelKey = (typeof layoutPanelNames)[number]

export type LayoutPanelSetting<T extends LayoutPanelKey> = (typeof layoutPanels)[T]['allowedElements'] | (string & {})[] // for generic checking, eg. .filter()

export type LayoutElementKey = (typeof layoutPanelElements)[number]['key'] | (string & {})
