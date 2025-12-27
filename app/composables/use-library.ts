export function useLibrary() {
  const { execute: addFolderToLibrary, isLoading: isAddingFolderToLibrary } = useAsyncState<void>(async (folderPath: string) => {
    const isFolder = await useTauriFsExists(folderPath)
    if (!isFolder)
      // TODO: show error toast
      return

    await $db().insertInto('library_folders').values({
      path: folderPath,
    }).execute()
  }, void 0, { immediate: false })

  return {
    addFolderToLibrary,
    isAddingFolderToLibrary,
  }
}
