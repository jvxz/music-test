import type { Error } from '~/utils/tauri-bindings'

export const ERROR_TITLE_MAP: Record<Error['type'], string> = {
  Audio: 'Audio error',
  FileSystem: 'File system error',
  Id3: 'ID3 error',
  LastFm: 'Last.fm error',
  Other: 'Unknown error',
  Sql: 'SQL error',
  Store: 'Store error',
  Stronghold: 'Stronghold error',
  Waveform: 'Waveform error',
}

export const errorHook = createEventHook<Error>()
export const emitError = useThrottleFn(errorHook.trigger, 1000)
