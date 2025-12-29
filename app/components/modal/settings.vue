<script lang="ts" setup>
const { open } = useSettingsModal()
</script>

<template>
  <UDialogRoot v-model:open="open">
    <UDialogContent class="w-full gap-0 p-0 sm:max-w-[58.5svw]">
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
