export type PlaylistEntry = Prettify<FileEntry & Selectable<DB['playlist_tracks']> & {
  is_playlist_track: true
}>
export type FolderEntry = Prettify<FileEntry & {
  is_playlist_track: false
}>

export type TrackListEntry = PlaylistEntry | FolderEntry

export type TrackListSortByFrame = keyof typeof ID3_MAP
export type TrackListEntryType = 'folder' | 'playlist' | 'library'
export type TrackListSortOrder = 'Asc' | 'Desc'

export type TrackListInput = {
  //    ↓ playlist id or folder path
  path: string
  sortBy: TrackListSortByFrame
  sortOrder: TrackListSortOrder
  type: TrackListEntryType
} | {
  //    ↓ library doesn't need a path
  path: never
  sortBy: TrackListSortByFrame
  sortOrder: TrackListSortOrder
  type: 'library'
}

//

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}
