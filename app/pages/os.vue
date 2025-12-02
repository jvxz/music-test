<script lang="ts" setup>
definePageMeta({
  category: 'system',
  description: 'Read operating system informations.',
  icon: 'lucide:info',
  name: 'OS Informations',
})

const items = ref([
  {
    content: `${useTauriOsPlatform()} ${useTauriOsVersion()}`,
    icon: 'lucide:monitor',
    label: 'System',
  },
  {
    content: useTauriOsArch(),
    icon: 'lucide:microchip',
    label: 'Arch',
  },
  {
    content: await useTauriOsLocale() || 'Not detectable',
    icon: 'lucide:globe',
    label: 'Locale',
  },
])
</script>

<template>
  <LayoutTile
    title="OS Information"
    description="Read information about the operating system using the OS Information plugin."
  >
    <UAccordion :items="items" type="multiple" />
  </LayoutTile>
</template>
