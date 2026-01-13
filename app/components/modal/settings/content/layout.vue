<script lang="ts" setup>
const panels: {
  class: string
  label: string
  key: string
}[] = [
  {
    class: 'h-full bg-muted/25 w-1/4 border-r',
    key: 'left',
    label: 'Left panel',
  },
  {
    class: 'h-full bg-muted/25 ml-auto w-1/4 border-l',
    key: 'right',
    label: 'Right panel',
  },
  {
    class: 'w-1/2 bg-muted/25 mx-auto h-full border-x',
    key: 'top',
    label: 'Main panel',
  },
  {
    class: 'h-1/3 w-full bg-muted/25 border-b',
    key: 'top',
    label: 'Top panel',
  },
  {
    class: 'h-1/3 mt-auto w-full bg-muted/25 border-t',
    key: 'bottom',
    label: 'Bottom panel',
  },
]
</script>

<template>
  <ModalSettingsContentLayout title="Layout">
    <div class="flex flex-col gap-6">
      <div
        v-for="panel in panels"
        :key="panel.label"
        class="flex items-start gap-2 overflow-hidden"
      >
        <div class="flex flex-col gap-2">
          <div class="aspect-video w-24 rounded border flex">
            <div :class="panel.class" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <ULabel>
            {{ panel.label }}
          </ULabel>
          <p class="text-sm text-muted-foreground">
            (hidden, no elements contained)
          </p>
        </div>
      </div>
    </div>
  </ModalSettingsContentLayout>
</template>
