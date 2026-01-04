import type { FuseResult } from 'fuse.js'
import { useFuse } from '@vueuse/integrations/useFuse'

export const useTrackListSearchQuery = createGlobalState(() => {
  const query = ref('')

  useRouter().afterEach(() => query.value = '')

  return query
})

export function useTrackListSearch(entries: Ref<PotentialFileEntry[]>) {
  const query = useTrackListSearchQuery()
  const { fuse, results: fuseResults } = useFuse(query, entries, {
    fuseOptions: {
      keys: ['tags.TIT2', 'tags.TPE1', 'tags.TALB', 'tags.TYER', 'tags.TCON', 'tags.TRCK', 'name'],
      threshold: 0.35,
    },
  })

  const results = computed(() => resultsToEntries(fuseResults.value))

  function resultsToEntries(results: FuseResult<PotentialFileEntry>[]): PotentialFileEntry[] {
    const mappedEntries = results.map((result) => {
      const entry = entries.value.find(entry => entry.path === result.item.path)
      if (!entry) {
        return null
      }

      return entry
    })

    return mappedEntries.filter(entry => entry !== null)
  }

  return {
    fuse,
    query,
    results,
  }
}
