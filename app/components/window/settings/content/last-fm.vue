<script lang="ts" setup>
const { authStatus, completeAuth, removeAuth, refreshAuthStatus, startAuth, useLastFmProfile } = useLastFm()

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
    emitError({ data: errorMsg, type: 'LastFm' })
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
  catch {
    emitError({ data: 'Failed to complete authentication. Did you complete the process in the new tab before continuing?', type: 'LastFm' })
  }
  finally {
    isAuthDialogOpen.value = false
    token.value = null
    isCompletingAuth.value = false
  }
}

const { data: profile, pending: profilePending } = useLastFmProfile(authStatus)

const { isOnline } = useNetwork()

onMounted(() => refreshAuthStatus())
</script>

<template>
  <WindowSettingsContentTabLayout title="Last.fm" class="flex *:h-full">
    <div class="flex w-full flex-col items-center gap-2">
      <div class="flex w-full items-center gap-2">
        <ULabel for="doScrobbling">
          Enable scrobbling
        </ULabel>
        <USwitch
          id="doScrobbling"
          v-model="$settings.lastFm.doScrobbling"
          :disabled="!authStatus"
        />
      </div>
      <div class="flex w-full items-center gap-2">
        <ULabel for="doOfflineScrobbling">
          Update "now playing" status
        </ULabel>
        <USwitch
          id="doNowPlayingUpdates"
          v-model="$settings.lastFm.doNowPlayingUpdates"
          :disabled="!authStatus"
        />
      </div>
      <div class="flex w-full items-center gap-2">
        <ULabel for="doOfflineScrobbling">
          Enable offline scrobbling
        </ULabel>
        <USwitch
          id="doOfflineScrobbling"
          v-model="$settings.lastFm.doOfflineScrobbling"
          :disabled="!authStatus"
        />
      </div>
    </div>
    <div class="flex w-fit shrink-0 justify-between gap-4">
      <template v-if="!isOnline">
        <!-- <div class="flex items-center justify-around gap-2 text-muted-foreground"> -->
        <div class="flex flex-col items-end justify-around text-muted-foreground">
          <p class="italic">
            You are currently offline
          </p>
          <UButton
            class="w-fit"
            :disabled="true"
          >
            Connect
          </UButton>
          <!-- <UHoverCardRoot>
            <UHoverCardTrigger as-child>
              <Icon name="tabler:info-circle" class="size-3.5!" />
            </UHoverCardTrigger>
            <UHoverCardContent side="left">
              <p>
                If you previously connected your Last.fm account, scrobbles are being cached and will be sent when you are back online.
              </p>
            </UHoverCardContent>
          </UHoverCardRoot> -->
        </div>
        <div class="grid size-[72px] place-items-center rounded border border-dashed border-muted">
          <Icon name="tabler:wifi-off" class="size-6! text-muted-foreground" />
        </div>
      </template>
      <template v-else-if="profilePending">
        <div class="flex flex-col items-end justify-around">
          <USkeleton class="h-lh w-32" />
          <UButton
            :disabled="true"
            class="w-fit"
            variant="outline"
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
        <div class="size-[72px] rounded border border-dashed border-muted"/>
      </template>
    </div>
  </WindowSettingsContentTabLayout>
</template>
