<script lang="ts" setup>
definePageMeta({
  category: 'interface',
  description: 'Send native notifications',
  icon: 'lucide:message-square-more',
  name: 'Notifications',
})

const schema = z.object({
  notificationBody: z.string().optional(),
  notificationTitle: z.string({
    error: 'Title is required',
  }).nonempty(),
})

type Schema = zInfer<typeof schema>

const inputState = ref<Partial<Schema>>({
  notificationBody: undefined,
  notificationTitle: undefined,
})

const toast = useToast()
const permissionGranted = ref(false)

async function createNotification() {
  permissionGranted.value = await useTauriNotificationIsPermissionGranted()

  if (!permissionGranted.value) {
    const permission = await useTauriNotificationRequestPermission()
    permissionGranted.value = permission === 'granted'
  }

  if (permissionGranted.value) {
    useTauriNotificationSendNotification({
      body: inputState.value.notificationBody,
      title: inputState.value.notificationTitle!,
    })

    inputState.value.notificationTitle = inputState.value.notificationBody = undefined
  }
  else {
    toast.add({
      color: 'error',
      description: 'Missing notifications permission',
      title: 'Error',
    })
  }
}
</script>

<template>
  <LayoutTile
    title="Notifications"
    description="Send native notifications to the client using the notification plugin."
  >
    <UForm
      :state="inputState"
      :schema="schema"
      class="flex flex-col items-end gap-y-4"
      @submit="createNotification"
    >
      <UFormField label="Notification title" name="notificationTitle">
        <UInput
          v-model="inputState.notificationTitle"
          variant="subtle"
          size="lg"
        />
      </UFormField>

      <UFormField label="Notification body (optional)" name="notificationBody">
        <UInput
          v-model="inputState.notificationBody"
          variant="subtle"
          size="lg"
        />
      </UFormField>

      <UButton type="submit" size="lg">
        Send notification
      </UButton>
    </UForm>
  </LayoutTile>
</template>
