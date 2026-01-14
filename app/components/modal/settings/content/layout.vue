<script lang="ts" setup>
const elementDragging = useState<LayoutElementKey | null>('layout-element-dragging', () => null)
</script>

<template>
  <ModalSettingsContentLayout title="Layout" class="h-full">
    <div class="flex h-full justify-between gap-4">
      <div class="flex flex-col gap-6">
        <TauriDragoverProvider
          v-for="panel in layoutPanels"
          :key="panel.label"
          :acceptable-keys="['layout-element']"
        >
          <div
            class="group -m-2 flex items-start gap-2 overflow-hidden rounded p-2 data-drag-over:bg-muted/50"
            :class="{
              'pointer-events-none opacity-50': elementDragging && !(panel.allowedElements as LayoutElementKey[]).includes(elementDragging),
            }"
          >
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
