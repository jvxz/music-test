<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
    <ModalFolderSelect />
  </NuxtLayout>
  <DevOnly>
    <DebugFps />
  </DevOnly>
</template>
