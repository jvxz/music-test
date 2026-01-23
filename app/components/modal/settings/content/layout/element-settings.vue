<script lang="ts" setup>
const { elementSettingsToShow: element } = useLayout()

const ElementSettings = computedWithControl(element, () => defineAsyncComponent<VNode>(async () => {
  if (!element.value)
    return null

  try {
    const component = await import(`~/components/modal/settings/content/layout/element-settings/${element.value}.vue`)
    return component
  }
  catch {
    return h('div', { innerHTML: `Please create ~/components/modal/settings/content/layout/element-settings/${element.value}.vue` })
  }
}))
</script>

<template>
  <UDialogRoot :open="!!element" @update:open="!$event && (element = undefined)">
    <!-- <UDialogContent class="flex flex-col sm:w-full lg:w-[850px] xl:w-[1050px] 2xl:w-[1150px]"> -->
    <UDialogContent class="flex flex-col w-2xl">
      <UDialogHeader>
        <UDialogTitle>
          {{ layoutPanelElements.find(e => e.key === element)?.label }}
        </UDialogTitle>
      </UDialogHeader>
      <ElementSettings />
    </UDialogContent>
  </UDialogRoot>
</template>
