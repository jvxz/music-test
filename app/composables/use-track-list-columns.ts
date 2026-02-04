import { getAllWebviewWindows } from '@tauri-apps/api/webviewWindow'

export const ALL_TRACK_LIST_COLUMNS: Record<Id3FrameId | string & {}, TrackListColumn> = {
  ...objectFromEntries(
    objectKeys(ID3_MAP).map(key => [
      key,
      {
        canSort: true,
        id3: key,
        key,
        label: ID3_MAP[key],
      },
    ]),
  ),
  // overrides / custom
  APIC: {
    canSort: false,
    hideLabelInColumn: true,
    key: 'APIC',
    label: 'Front cover',
    maxSize: 4,
    minSize: 2,
  },
  CURRENTLY_PLAYING: {
    canSort: false,
    hideLabelInColumn: true,
    key: 'CURRENTLY_PLAYING',
    label: 'Currently playing',
    maxSize: 1.5,
    minSize: 1.5,
  },
}

export interface TrackListColumn {
  id3?: Id3FrameId
  key: Id3FrameId | string & {}
  label: string
  default?: keyof TrackListEntry
  canSort: boolean
  minSize?: number
  maxSize?: number
  hideLabelInColumn?: boolean
}

export const useTrackListColumns = createSharedComposable(() => {
  const { layoutPanels } = usePersistentPanels('track-list-columns', [
    3,
    1.5,
    34.0888869203,
    15.1599593363,
    15.0211805522,
    8.5755556775,
    14.3210841804,
    8.3333333333,
  ])

  const { execute: createSetDisplayedFieldsWindow, state: setDisplayedFieldsWindow } = useAsyncState(async () => createTauriWindow('track-list-columns', {
    center: true,
    height: 800,
    resizable: import.meta.env.DEV,
    title: 'Set displayed fields',
    url: '/set-displayed-fields',
    width: 600,
  }), null, { immediate: false })

  async function openSetDisplayedFieldsWindow() {
    const webviews = await getAllWebviewWindows()
    const targetWebview = webviews.find(w => w.label === 'track-list-columns')

    if (targetWebview) {
      targetWebview.setFocus()
      return
    }

    createSetDisplayedFieldsWindow()
  }

  const settings = useSettings()

  function getColumnFields(as: 'objects'): ComputedRef<TrackListColumn[]>
  function getColumnFields(as: 'keys'): ComputedRef<TrackListColumn['key'][]>
  function getColumnFields(as = 'objects' as 'keys' | 'objects'): ComputedRef<TrackListColumn['key'][]> | ComputedRef<TrackListColumn[]> {
    return as === 'keys'
      ? computed<TrackListColumn['key'][]>({
          // get: () => trackListSettings.value.columnFields,
          get: () => settings.layout.element.trackList.columnFields,
          // set: (value: TrackListColumn['key'][]) => trackListSettings.value.columnFields = value,
          set: (value: TrackListColumn['key'][]) => settings.layout.element.trackList.columnFields = value,
        })
      : computed<TrackListColumn[]>({
          // get: () => trackListSettings.value.columnFields.map(key => getColumnFromKey(key)),
          get: () => settings.layout.element.trackList.columnFields.map(key => getColumnFromKey(key)),
          // set: (value: TrackListColumn[]) => trackListSettings.value.columnFields = value.map(column => column.key),
          set: (value: TrackListColumn[]) => settings.layout.element.trackList.columnFields = value.map(column => column.key),
        })
  }

  watch(() => settings.layout.element.trackList.columnFields, (newColumns, oldColumns) => {
    const newColSizeRate = 0.8

    if (newColumns.length > oldColumns.length) {
      // processing add
      const newColumn = newColumns.filter(c => !oldColumns.includes(c))[0]
      if (!newColumn) {
        return emitError({
          data: 'Could not get new column when attempting to render new track list columns',
          type: 'Other',
        })
      }

      const totalPercentOfOldCols = layoutPanels.value.reduce((prev, curr) => curr + prev, 0)
      const newColSize = (totalPercentOfOldCols / newColumns.length) / newColSizeRate
      const remainder = Math.abs(totalPercentOfOldCols - 100) / oldColumns.length

      const newColIdx = newColumns.indexOf(newColumn)
      if (newColIdx < 0) {
        return emitError({
          data: `New column index was less than 0 (was -1)`,
          type: 'Other',
        })
      }

      const toSubtract = newColSize / oldColumns.length - remainder
      const newLayoutPanelSizes = layoutPanels.value.map((p, i) => i === newColIdx ? newColSize : p - toSubtract)

      layoutPanels.set(newLayoutPanelSizes)
    }
  })

  function getColumnFromKey(key: TrackListColumn['key']): TrackListColumn {
    const col = ALL_TRACK_LIST_COLUMNS[key]

    if (!col) {
      throw new Error(`Attempted to get column from key ${key} but it was not found in the list of all columns`)
    }

    return col
  }

  function setColumnFields(fieldKeys: TrackListColumn['key'][]) {
    settings.layout.element.trackList.columnFields = fieldKeys
  }

  return {
    getColumnFields,
    getColumnFromKey,
    layoutPanels,
    openSetDisplayedFieldsWindow,
    setColumnFields,
    setDisplayedFieldsWindow,
  }
})
