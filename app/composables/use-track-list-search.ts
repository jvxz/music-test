import type { SearchResult } from 'minisearch'
import MiniSearch from 'minisearch'

const minisearch = new MiniSearch({
  extractField: (document, fieldName) => fieldName.split('.').reduce((doc, key) => doc && doc[key], document),
  fields: ['tags.TIT2', 'tags.TPE1', 'tags.TALB', 'tags.TYER', 'tags.TCON', 'tags.TRCK', 'name'],
  idField: 'path',
  searchOptions: {
    fuzzy: 0.2,
    prefix: true,
  },
  storeFields: ['path'],
})

export const useTrackListSearchQuery = createGlobalState(() => {
  const query = ref('')

  useRouter().afterEach(() => query.value = '')

  return query
})

export function useTrackListSearch(entries: Ref<TrackListEntry[]>) {
  const results = shallowRef<TrackListEntry[]>([])
  const query = useTrackListSearchQuery()

  const { execute: index, isLoading: isIndexing } = useAsyncState(async () => {
    if (!entries.value.length)
      return

    minisearch.removeAll()
    minisearch.addAll(entries.value)
  }, undefined, {
    immediate: true,
  })

  watch(entries, () => index())

  watch(query, (value) => {
    if (value) {
      results.value = resultsToEntries(minisearch.search(value))
    }
    else {
      results.value = []
    }
  }, { immediate: true })

  function resultsToEntries(results: SearchResult[]): TrackListEntry[] {
    const mappedEntries = results.map((result) => {
      const entry = entries.value.find(entry => entry.path === result.id)
      if (!entry) {
        return null
      }

      return entry
    })

    return mappedEntries.filter(entry => entry !== null)
  }

  return {
    isIndexing,
    query,
    results,
  }
}
