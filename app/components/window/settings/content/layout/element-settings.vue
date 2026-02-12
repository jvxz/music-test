<script lang="ts" setup>
const { elementSettingsToShow: element } = useLayout()

const ElementSettings = computedWithControl(element, () => defineAsyncComponent<VNode>(async () => {
  if (!element.value)
    return null

  const filename = kebabCase(element.value)

  try {
    const component = await import(`~/components/window/settings/content/layout/element-settings/${filename}.vue`)
    return component
  }
  catch {
    return h('div', { innerHTML: `Please create ~/components/window/settings/content/layout/element-settings/${filename}.vue` })
  }
}))
</script>

<template>
  <UDialogRoot :open="!!element" @update:open="!$event && (element = undefined)">
    <!-- <UDialogContent class="flex flex-col sm:w-full lg:w-[850px] xl:w-[1050px] 2xl:w-[1150px]"> -->
    <UDialogContent class="flex w-2xl flex-col">
      <UDialogHeader>
        <UDialogTitle>
          {{ layoutPanelElements.find(e => e.key === element)?.label }}
        </UDialogTitle>
      </UDialogHeader>
      <ElementSettings />
    </UDialogContent>
  </UDialogRoot>
</template>
