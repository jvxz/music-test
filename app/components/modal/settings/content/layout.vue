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
  <ModalSettingsContentLayout title="Layout" class="h-full">
    <div class="flex h-full justify-between gap-4">
      <div class="flex flex-col gap-6">
        <TauriDragoverProvider
          v-for="panel in panels"
          :key="panel.label"
          :acceptable-keys="['layout-element']"
        >
          <div class="group -m-2 flex items-start gap-2 overflow-hidden rounded p-2 data-drag-over:bg-muted/50">
            <div class="flex flex-col gap-2">
              <div class="flex aspect-video w-24 rounded border">
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
        </TauriDragoverProvider>
      </div>
      <ModalSettingsContentLayoutElements />
    </div>
  </ModalSettingsContentLayout>
</template>
