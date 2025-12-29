<script lang="ts" setup>
const { tab } = useSettingsModal()

const components = Object.fromEntries(
  SETTINGS_MODAL_TABS.map(
    t => [t, defineAsyncComponent(async () => {
      try {
        const component = await import(`~/components/modal/settings/content/${t}.vue`)
        return component
      }
      catch {
        return h('div', { innerHTML: `Please create ~/components/modal/settings/content/${t}.vue` })
      }
    })],
  ),
)
</script>

<template>
  <TabsRoot
    v-model:model-value="tab"
    orientation="vertical"
    class="flex size-full items-center *:p-4"
  >
    <TabsList class="flex w-[300px] shrink-0 flex-col gap-1 border-r *:justify-start">
      <TabsTrigger
        v-for="tab in SETTINGS_MODAL_TABS"
        :key="tab"
        :value="tab"
        as-child
      >
        <UButton variant="ghost" class="w-full justify-start">
          {{ sentenceCase(tab) }}
        </UButton>
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="tab in SETTINGS_MODAL_TABS"
      :key="tab"
      :value="tab"
    >
      <component :is="components[tab]" />
    </TabsContent>
  </TabsRoot>
  <UDialogFooter class="border-t p-4">
    <UButton disabled variant="soft">
      Apply
    </UButton>
    <UDialogClose as-child>
      <UButton variant="soft">
        Close
      </UButton>
    </UDialogClose>
  </UDialogFooter>
</template>
