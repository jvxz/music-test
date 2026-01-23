<script lang="ts" setup>
const { elementSettingsToShow: element } = useLayout()
</script>

<template>
  <UDialogRoot :open="!!element" @update:open="!$event && (element = undefined)">
    <UDialogContent class="sm:w-full lg:w-[850px] xl:w-[1050px] 2xl:w-[1150px]">
      <UDialogHeader>
        <UDialogTitle>
          {{ layoutPanelElements.find(e => e.key === element)?.label }}
        </UDialogTitle>
      </UDialogHeader>
    </UDialogContent>
  </UDialogRoot>
</template>
