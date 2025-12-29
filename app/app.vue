<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
    <ModalItemSearch />
    <ModalSettings />
  </NuxtLayout>
  <DevOnly>
    <DebugFps />
  </DevOnly>
</template>
