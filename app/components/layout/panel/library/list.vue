<script lang="ts" setup>
const { playlists } = useUserPlaylists()

const { getLibraryFolders } = useLibrary()
const { data: folders } = getLibraryFolders()
</script>

<template>
  <LayoutPanelLibraryListPlaylistCollapsible v-if="playlists" :playlists="playlists" />
  <LayoutPanelLibraryListFolderCollapsible v-if="folders" :folders="folders" />
</template>
