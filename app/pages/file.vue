<script lang="ts" setup>
definePageMeta({
  category: 'storage',
  description: 'Create and manage files',
  icon: 'lucide:file-text',
  name: 'Files',
})

const schema = z.object({
  fileContent: z.string({
    error: 'File content is required',
  }).nonempty(),
  fileName: z.string({
    error: 'File name is required',
  }).nonempty().regex(/^[\w,\s-]+\.[A-Z0-9]+$/i, {
    message: 'Invalid filename format',
  }),
})

type Schema = zInfer<typeof schema>

const inputState = ref<Partial<Schema>>({
  fileContent: undefined,
  fileName: undefined,
})

const toast = useToast()

async function createFile() {
  try {
    const fileExists = await useTauriFsExists(inputState.value.fileName!, {
      baseDir: useTauriFsBaseDirectory.Document,
    })

    if (fileExists) {
      toast.add({
        color: 'error',
        description: 'The file already exists',
        title: 'Error',
      })

      return
    }

    await useTauriFsWriteTextFile(inputState.value.fileName!, inputState.value.fileContent!, {
      baseDir: useTauriFsBaseDirectory.Document,
    })
    toast.add({
      color: 'success',
      description: 'The file has been created',
      title: 'Success',
    })
    inputState.value.fileName = inputState.value.fileContent = undefined
  }
  catch (err) {
    toast.add({
      color: 'error',
      description: String(err),
      title: 'Error',
    })
  }
}
</script>

<template>
  <LayoutTile
    title="File System"
    description="Access the file system. For this demo the only allowed permission is read/write to the Documents folder (no sub directories)."
  >
    <UForm
      :state="inputState"
      :schema="schema"
      class="flex flex-col items-end gap-y-4"
      @submit="createFile"
    >
      <UFormField label="Text file name (with extension)" name="fileName">
        <UInput
          v-model="inputState.fileName"
          variant="subtle"
          size="lg"
        />
      </UFormField>

      <UFormField label="File content" name="fileContent">
        <UTextarea
          v-model="inputState.fileContent"
          variant="subtle"
          size="lg"
          :rows="10"
        />
      </UFormField>

      <UButton type="submit" size="lg">
        Create file
      </UButton>
    </UForm>
  </LayoutTile>
</template>
