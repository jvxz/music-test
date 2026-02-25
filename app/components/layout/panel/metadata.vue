<script lang="ts" setup>
const { currentTrack } = usePlayback()

const { commitChanges, isDirty, revertAllChanges } = useMetadata(currentTrack, 'panel')

const id3Tag = computed(() => currentTrack.value?.primary_tag ?? ID3_DEFAULT_TAG)
const { openElementWindow } = useLayout()

const form = useTemplateRef<HTMLFormElement>('form')
const { focused: isFormFocused } = useFocusWithin(form)
onKeyStrokeSafe('meta_s', () => {
  if (isDirty.value && isFormFocused.value)
    commitChanges()
}, { activeElement: form })

onKeyStrokeSafe('meta_r', () => {
  if (isDirty.value && isFormFocused.value)
    revertAllChanges()
}, { activeElement: form })
</script>

<template>
  <LayoutPanelLayout class="size-full gap-0 overflow-y-auto p-0 *:shrink-0">
    <UContextMenu>
      <UContextMenuTrigger as-child>
        <div class="flex w-full items-center gap-1 border-b pr-2 pl-1">
          <div class="m-1 flex items-center gap-1">
            <UButton
              :disabled="!isDirty"
              variant="ghost"
              size="icon"
              class="size-6 shrink-0"
              :class="{
                'text-emerald-500 hover:text-emerald-500 active:text-emerald-500': isDirty,
              }"
              title="Save changes to file"
              @click="commitChanges()"
            >
              <Icon name="tabler:check" />
            </UButton>
            <UButton
              :disabled="!isDirty"
              variant="ghost"
              size="icon"
              class="size-6 shrink-0"
              :class="{
                'text-danger hover:text-danger active:text-danger': isDirty,
              }"
              title="Save changes to file"
              @click="revertAllChanges()"
            >
              <Icon name="tabler:arrow-back-up" />
            </UButton>
          </div>
          <p class="w-full flex-1 truncate text-xs font-medium text-muted-foreground" :title="currentTrack?.filename">
            {{ currentTrack?.filename }}
          </p>
          <USelectRoot>
            <USelectTrigger
              title="ID3 tag"
              variant="ghost"
              size="sm"
              :with-icon="false"
            >
              <USelectValue>
                {{ formatId3Tag(id3Tag) }}
              </USelectValue>
            </USelectTrigger>
            <USelectContent :side-offset="3">
              <USelectItem
                v-for="tag in ID3_TAG_TYPES"
                :key="tag"
                :value="tag"
              >
                <USelectItemText>
                  {{ formatId3Tag(tag) }}
                </USelectItemText>
              </USelectItem>
            </USelectContent>
          </USelectRoot>
        </div>
      </UContextMenuTrigger>
      <UContextMenuContent>
        <UContextMenuItem @click="openElementWindow('metadataView')">
          Set displayed frames...
        </UContextMenuItem>
      </UContextMenuContent>
    </UContextMenu>

    <form class="flex flex-col gap-2 p-4">
      <LayoutPanelMetadataField
        v-for="frame in $settings.layout.element.metadataView.frames"
        :key="frame"
        :id3-frame="frame"
        :track="currentTrack"
      />
    </form>
  </LayoutPanelLayout>
</template>
