<script lang="ts" setup>
const open = ref(false)
const input = ref('')

onKeyStrokeSafe('meta_p', () => {
  open.value = !open.value
}, { ignore: ['[data-slot="command-input"]'] })
</script>

<template>
  <UCommandDialog :open="open" @update:open="open = $event">
    <UCommandRoot class="relative size-full h-65">
      <UCommandInput
        v-model="input"
        icon="tabler:folder"
        placeholder="Enter a playlist, folder, or file"
        class="me-7"
      />
      <UButton
        :disabled="!input"
        class="absolute top-2.25 right-2 w-fit"
        variant="ghost"
        size="icon"
      >
        <Icon name="tabler:arrow-right" />
      </UButton>
      <UCommandList>
        <UCommandGroup heading="Recents">
          <UCommandItem v-for="i in 10" :key="i" value="test">
            Test
          </UCommandItem>
        </UCommandGroup>
      </UCommandList>
    </UCommandRoot>
  </UCommandDialog>
</template>
