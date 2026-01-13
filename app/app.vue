<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
    <ModalItemSearch />
    <ModalSettings />
  </NuxtLayout>
  <DevOnly>
    <DebugDetails />
  </DevOnly>
</template>
