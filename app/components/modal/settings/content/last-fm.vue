<script lang="ts" setup>
const { rpc } = useTauri()
const { execute: openLastFmAuth, state: token } = useAsyncState(() => rpc.open_lastfm_auth(), undefined, {
  immediate: false,
})

function completeAuthorization() {
  if (!token.value)
    return

  rpc.get_lastfm_session_key(token.value)
}
</script>

<template>
  <ModalSettingsContentLayout>
    <UButton @click="openLastFmAuth()">
      Authorize
    </UButton>
    <UButton :disabled="!token" @click="completeAuthorization()">
      Complete authorization
    </UButton>
  </ModalSettingsContentLayout>
</template>
