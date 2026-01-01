<script lang="ts" setup>
const { authStatus, completeAuth, removeAuth, startAuth } = useLastFm()

const token = shallowRef<string | null>(null)

async function handleStartAuth() {
  token.value = await startAuth()
}
</script>

<template>
  <ModalSettingsContentLayout>
    <UButton @click="handleStartAuth()">
      Authorize
    </UButton>
    <UButton :disabled="!token" @click="completeAuth(token!)">
      Complete authorization
    </UButton>
    <UButton :disabled="!authStatus" @click="removeAuth()">
      Remove authorization
    </UButton>
  </ModalSettingsContentLayout>
</template>
