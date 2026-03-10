const scrollStateMap = new Map<string, number>()

export const useTrackListScrollState = createGlobalState(() => ({
  scrollStateMap,
}))
