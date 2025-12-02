<script lang="ts" setup>
definePageMeta({
  category: 'storage',
  description: 'Handle file creation in the file system',
  icon: 'lucide:database',
  name: 'Store',
})

const schema = z.object({
  value: z.string({
    error: 'Store key is required',
  }).nonempty(),
})

type Schema = zInfer<typeof schema>

const inputState = ref<Partial<Schema>>({
  value: undefined,
})
const outputState = ref({
  content: '',
})

const toast = useToast()
const autosave = ref(false)

const store = await useTauriStoreLoad('store.bin', {
  autoSave: autosave.value,
})

async function getStoreValue() {
  try {
    outputState.value.content = await store.get<string>('myData') || ''
  }
  catch (error) {
    toast.add({
      color: 'error',
      description: String(error),
      title: 'Error',
    })
    outputState.value.content = JSON.stringify(error, null, 4)
  }
}

await getStoreValue()

async function setStoreValue() {
  try {
    await store.set('myData', inputState.value!.value)
    await getStoreValue()
    toast.add({
      color: 'success',
      description: 'Store value retieved',
      title: 'Success',
    })
  }
  catch (error) {
    toast.add({
      color: 'error',
      description: String(error),
      title: 'Error',
    })
    outputState.value.content = JSON.stringify(error, null, 4)
  }
  finally {
    inputState.value.value = undefined
  }
}
</script>

<template>
  <LayoutTile
    title="Store"
    description="Persistent key-value store. Allows you to handle state to a file which can be saved and loaded on demand including between app restarts."
  >
    <div class="space-y-6 md:space-y-8">
      <UForm
        :state="inputState"
        :schema="schema"
        class="flex flex-col items-end gap-y-4"
        @submit="setStoreValue"
      >
        <UFormField label="Store value" name="value">
          <UInput
            v-model="inputState.value"
            variant="subtle"
            size="lg"
          />
        </UFormField>

        <UButton type="submit" size="lg">
          Set value
        </UButton>
      </UForm>

      <UForm :state="outputState" class="flex flex-col items-end gap-y-4">
        <UFormField label="Store content" name="content">
          <UTextarea
            v-model="outputState.content"
            variant="subtle"
            size="lg"
            :rows="8"
            readonly
          />
        </UFormField>
      </UForm>
    </div>
  </LayoutTile>
</template>
