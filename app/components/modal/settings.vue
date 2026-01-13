<script lang="ts" setup>
const { open } = useSettingsModal()
</script>

<template>
  <UDialogRoot v-model:open="open">
    <UDialogContent class="gap-0 p-0 bg-background sm:w-full lg:w-[1000px] xl:w-[1200px] 2xl:w-[1300px]">
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
