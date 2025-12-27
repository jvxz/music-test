export function useLibrary() {
  const { execute: addFolderToLibrary, isLoading: isAddingFolderToLibrary } = useAsyncState<void>(async (folderPath: string) => {
    const isFolder = await useTauriFsExists(folderPath)
    if (!isFolder)
      // TODO: show error toast
      return

    await $db().insertInto('library_folders').values({
      path: folderPath,
    }).execute()

    refreshNuxtData(buildFolderInLibraryKey(folderPath))
  }, void 0, { immediate: false })

  const { execute: removeFolderFromLibrary, isLoading: isRemovingFolderFromLibrary } = useAsyncState<void>(async (folderPath: string) => {
    await $db().deleteFrom('library_folders').where('path', '=', folderPath).execute()

    refreshNuxtData(buildFolderInLibraryKey(folderPath))
  }, void 0, { immediate: false })

  const useFolderInLibrary = (folderPath: string) => useAsyncData(computed(() => buildFolderInLibraryKey(folderPath)), () => {
    return $db().selectFrom('library_folders').where('path', '=', folderPath).selectAll().executeTakeFirst()
  }, { immediate: false })

  return {
    addFolderToLibrary,
    isAddingFolderToLibrary,
    isRemovingFolderFromLibrary,
    removeFolderFromLibrary,
    useFolderInLibrary,
  }
}

function buildFolderInLibraryKey(folderPath: string) {
  return `${folderPath}-in-library`
}
