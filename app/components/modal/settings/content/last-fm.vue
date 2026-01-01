<script lang="ts" setup>
const { authStatus, completeAuth, removeAuth, startAuth } = useLastFm()
const { getSettingValueRef } = useSettings()

const doScrobbling = getSettingValueRef('last-fm.do-scrobbling')
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
    <div class="flex items-center gap-2">
      <ULabel for="doScrobbling">
        Enable scrobbling
      </ULabel>
      <USwitch id="doScrobbling" v-model="doScrobbling" />
    </div>
  </ModalSettingsContentLayout>
</template>
