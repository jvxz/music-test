const SUPPORTED_EXTENSIONS = ['mp3', 'mp2', 'mp1', 'flac', 'wav', 'ogg', 'oga', 'm4a', 'aac']

export async function getTracksData(paths: string[]): Promise<FileEntry[]> {
  const tracks = await $invoke(commands.getTracksData, paths)

  const unsupportedExtensions: string[] = []

  const res = await Promise.all(tracks.map(async (track): Promise<FileEntry> => {
    if (!SUPPORTED_EXTENSIONS.includes(track.extension.toLowerCase())) {
      unsupportedExtensions.push(track.extension)
    }

    return track
  }))

  if (unsupportedExtensions.length > 0) {
    emitError({
      data: `Unsupported extensions: .${unsupportedExtensions.join(', .')}`,
      type: 'FileSystem',
    })
  }

  return res
}
