<script lang="ts" setup>
const { playlists } = useUserPlaylists()

const { getLibraryFolders } = useLibrary()
const { data: folders } = getLibraryFolders()
</script>

<template>
  <LayoutLibraryListPlaylistCollapsible v-if="playlists" :playlists="playlists" />
  <LayoutLibraryListFolderCollapsible v-if="folders" :folders="folders" />
</template>
