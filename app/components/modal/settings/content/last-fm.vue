<script lang="ts" setup>
import { message } from '@tauri-apps/plugin-dialog'

const { authStatus, completeAuth, removeAuth, startAuth, useLastFmProfile } = useLastFm()

const { getSettingValueRef } = useSettings()

const doScrobbling = getSettingValueRef('last-fm.do-scrobbling')
const token = shallowRef<string | null>(null)
const isAuthDialogOpen = shallowRef(false)
const isCompletingAuth = shallowRef(false)

async function handleStartAuth() {
  if (isAuthDialogOpen.value || authStatus.value)
    return

  isAuthDialogOpen.value = true

  try {
    token.value = await startAuth()
  }
  catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    await message(errorMsg, { kind: 'error', title: 'Last.fm Auth Error' })
    isAuthDialogOpen.value = false
  }
}

async function handleCompleteAuth() {
  if (!token.value)
    return

  isCompletingAuth.value = true

  try {
    await completeAuth(token.value)
  }
  finally {
    isAuthDialogOpen.value = false
    token.value = null
    isCompletingAuth.value = false
  }
}

const { data: profile, pending: profilePending } = useLastFmProfile(authStatus)
</script>

<template>
  <ModalSettingsContentLayout title="Last.fm" class="flex *:h-full">
    <div class="flex w-full flex-col items-center gap-2">
      <div class="flex w-full items-center gap-2">
        <ULabel for="doScrobbling">
          Enable scrobbling
        </ULabel>
        <USwitch
          id="doScrobbling"
          v-model="doScrobbling"
          :disabled="!authStatus"
        />
      </div>
    </div>
    <div class="flex w-fit shrink-0 justify-between gap-4">
      <template v-if="profilePending">
        <div class="flex flex-col items-end justify-around">
          <USkeleton class="h-lh w-24" />
          <UButton
            :disabled="true"
            class="w-fit"
            variant="danger"
          >
            Loading...
          </UButton>
        </div>
        <div class="size-[72px] rounded border border-dashed border-muted"></div>
      </template>
      <template v-else-if="profile">
        <div class="flex flex-col items-end justify-around">
          <p>Signed in as <span class="font-bold">{{ authStatus }}</span></p>
          <UButton
            class="w-fit"
            variant="danger"
            @click="removeAuth()"
          >
            Disconnect
          </UButton>
        </div>
        <img
          :src="getLastFmImage(profile.image, 3) ?? ''"
          alt=""
          width="72"
          height="72"
          class="rounded"
        >
      </template>
      <template v-else>
        <div class="flex flex-col items-end justify-around">
          <p>No account connected</p>
          <UAlertDialogRoot :open="isAuthDialogOpen">
            <UAlertDialogTrigger as-child>
              <UButton
                class="w-fit"
                :is-loading="isAuthDialogOpen"
                @click="handleStartAuth()"
              >
                Connect
              </UButton>
            </UAlertDialogTrigger>
            <UAlertDialogContent>
              <p class="text-sm">
                You are about to be directed to a new tab in your browser. Click button below once you have completed the authentication process.
              </p>
              <UAlertDialogFooter>
                <UButton
                  :is-loading="isCompletingAuth"
                  @click="handleCompleteAuth()"
                >
                  Complete
                </UButton>
              </UAlertDialogFooter>
            </UAlertDialogContent>
          </UAlertDialogRoot>
        </div>
        <div class="size-[72px] rounded border border-dashed border-muted"></div>
      </template>
    </div>
  </ModalSettingsContentLayout>
</template>
