<script lang="ts" setup>
const { rpc } = useTauri()
const { execute: openLastFmAuth, state: token } = useAsyncState(() => rpc.open_lastfm_auth(), undefined, {
  immediate: false,
})

async function completeAuthorization() {
  if (!token.value)
    return

  const name = await rpc.complete_lastfm_auth(token.value)
  console.log('name: ', name)
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
    <UButton @click="rpc.remove_lastfm_account()">
      Remove authorization
    </UButton>
  </ModalSettingsContentLayout>
</template>
