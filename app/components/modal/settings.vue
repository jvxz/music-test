<script lang="ts" setup>
const { open } = useSettingsModal()
</script>

<template>
  <UDialogRoot v-model:open="open">
    <UDialogContent class="w-full sm:max-w-[58.5svw]">
      <UDialogHeader>
        <UDialogTitle>
          Settings
        </UDialogTitle>
      </UDialogHeader>
      <UDialogFooter>
        <UButton disabled variant="soft">
          Apply changes
        </UButton>
        <UDialogClose as-child>
          <UButton variant="soft">
            Close
          </UButton>
        </UDialogClose>
      </UDialogFooter>
    </UDialogContent>
  </UDialogRoot>
</template>
