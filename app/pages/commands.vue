<script lang="ts" setup>
definePageMeta({
  category: 'system',
  description: 'Execute shell commands',
  icon: 'lucide:terminal',
  name: 'Shell commands',
})

const schema = z.object({
  input: z.string({
    error: 'Input is required',
  }).nonempty(),
})

type Schema = zInfer<typeof schema>

const inputState = ref<Partial<Schema>>({
  input: undefined,
})
const outputState = ref({
  output: '',
})

async function sendCommand() {
  try {
    const response = await useTauriShellCommand.create('exec-sh', [
      '-c',
      inputState.value.input!,
    ]).execute()

    outputState.value.output = JSON.stringify(response, null, 4)
  }
  catch (error) {
    outputState.value.output = JSON.stringify(error, null, 4)
  }
  finally {
    inputState.value.input = undefined
  }
}
</script>

<template>
  <LayoutTile
    title="Commands"
    description="Access the system shell. Allows you to spawn child processes and manage files and URLs using their default application."
  >
    <div class="space-y-6 md:space-y-8">
      <UForm
        :state="inputState"
        :schema="schema"
        class="flex flex-col items-end gap-y-4"
        @submit="sendCommand"
      >
        <UFormField label="Command input" name="input">
          <UInput
            v-model="inputState.input"
            variant="subtle"
            size="lg"
          />
        </UFormField>

        <UButton type="submit" size="lg">
          Send command
        </UButton>
      </UForm>

      <UForm :state="outputState" class="flex flex-col items-end gap-y-4">
        <UFormField label="Command output" name="command-output">
          <UTextarea
            v-model="outputState.output"
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
