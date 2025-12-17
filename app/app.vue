<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
    <ModalItemSearch />
  </NuxtLayout>
  <DevOnly>
    <DebugFps />
  </DevOnly>
</template>
