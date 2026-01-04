const GREATER = 1
const LESSER = -1

export const sortTrackList = createUnrefFn((trackList: PotentialFileEntry[], sortBy: TrackListSortByFrame, sortOrder: TrackListSortOrder) => {
  const sortedTrackList = trackList.toSorted((a, b) => {
    if (!a.valid || !b.valid) {
      return LESSER
    }

    let aValue: string | undefined
    let bValue: string | undefined

    if (sortBy === 'TIT2') {
      aValue = a.tags.TIT2 ?? a.name
      bValue = b.tags.TIT2 ?? b.name
    }
    else {
      aValue = a.tags[sortBy]
      bValue = b.tags[sortBy]
    }

    if (aValue === undefined && bValue === undefined)
      return 0
    if (aValue === undefined)
      return GREATER
    if (bValue === undefined)
      return LESSER

    return aValue.localeCompare(bValue)
  })

  return sortOrder === 'Asc' ? sortedTrackList : sortedTrackList.reverse()
})
