import { getAllWebviewWindows } from '@tauri-apps/api/webviewWindow'

type CustomColumnKey = 'CURRENTLY_PLAYING'

export const ALL_TRACK_LIST_COLUMNS: Record<Id3FrameId | CustomColumnKey, TrackListColumn> = $defu(
  {
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
      special: true,
    },
  },
  objectFromEntries(
    objectKeys(ID3_MAP).map(key => [
      key,
      {
        canSort: true,
        id3: key,
        key,
        label: ID3_MAP[key],
        minSize: 3,
      },
    ]),
  ),
)

export interface TrackListColumn {
  id3?: Id3FrameId
  key: Id3FrameId | CustomColumnKey
  label: string
  default?: keyof TrackListEntry
  canSort: boolean
  minSize?: number
  maxSize?: number
  hideLabelInColumn?: boolean
  special?: boolean
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
    height: 900,
    resizable: import.meta.env.DEV,
    title: 'Set displayed fields',
    url: '/set-displayed-fields',
    width: 800,
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

  function getColumnFields(as: 'objects'): WritableComputedRef<TrackListColumn[]>
  function getColumnFields(as: 'keys'): WritableComputedRef<TrackListColumn['key'][]>
  function getColumnFields(as = 'objects' as 'keys' | 'objects'): WritableComputedRef<TrackListColumn['key'][]> | WritableComputedRef<TrackListColumn[]> {
    return as === 'keys'
      ? computed<TrackListColumn['key'][]>({
          get: () => settings.layout.element.trackList.columnFields,
          set: (value: TrackListColumn['key'][]) => settings.layout.element.trackList.columnFields = value,
        })
      : computed<TrackListColumn[]>({
          get: () => settings.layout.element.trackList.columnFields.map(key => getColumnFromKey(key)),
          set: (value: TrackListColumn[]) => settings.layout.element.trackList.columnFields = value.map(column => column.key),
        })
  }

  watch(() => settings.layout.element.trackList.columnFields, (newColumns, oldColumns) => {
    const newColSizeRate = 0.8

    // process add
    if (newColumns.length > oldColumns.length) {
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
