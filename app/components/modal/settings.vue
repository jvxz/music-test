<script lang="ts" setup>
const { open } = useSettingsModal()
</script>

<template>
  <UDialogRoot v-model:open="open">
    <UDialogContent class="gap-0 p-0 sm:max-w-[40svw] bg-background">
      <VisuallyHidden as-child>
        <UDialogHeader>
          <UDialogTitle>
            Settings
          </UDialogTitle>
        </UDialogHeader>
      </VisuallyHidden>
      <ModalSettingsContent />
    </UDialogContent>
  </UDialogRoot>
</template>
