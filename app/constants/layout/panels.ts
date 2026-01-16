/* eslint-disable perfectionist/sort-objects */
export const layoutPanelNames = ['top', 'left', 'main', 'right', 'bottom'] as const

export const layoutPanels = {
  top: {
    allowedElements: [
      'track-list',
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
      'track-list',
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
      'track-list',
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

export type LayoutPanelSetting<T extends LayoutPanelKey> = (typeof layoutPanels)[T]['allowedElements']
