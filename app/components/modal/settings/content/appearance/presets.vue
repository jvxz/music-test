<script lang="ts" setup>
import { confirm } from '@tauri-apps/plugin-dialog'

const settings = useSettings()

const presets = settings.appearance.presets

const presetArray = computed(() => Array.from(Object.entries(presets)).map(([name, colors]) => ({
  colors,
  name,
})))

const selectedPreset = shallowRef<typeof presetArray.value[number] | null>(null)
function handlePresetClick(preset: typeof presetArray.value[number]) {
  settings.appearance.token = preset.colors
  selectedPreset.value = preset
}

// const alertDialogAction = shallowRef<'save-new' | 'rename' | null>(null)

const dialogOpen = shallowRef(false)
const presetName = shallowRef('')
async function handlePresetSave() {
  if (presetName.value.length === 0)
    return

  let confirmation = true
  if (presetArray.value.some(p => p.name === presetName.value)) {
    confirmation = await confirm('A preset with this name already exists. Overwrite?')
  }

  if (!confirmation)
    return

  dialogOpen.value = false

  const theme = Object.fromEntries(
    Object.entries(settings).filter(([key]) => key.startsWith('appearance.token.')),
  ) as Record<SettingsEntryKey & `appearance.token.${string}`, string>

  settings.$patch({
    appearance: {
      presets: {
        ...settings.appearance.presets,
        [presetName.value]: theme,
      },
    },
  })
  presetName.value = ''
}

async function handlePresetDelete() {
  if (!selectedPreset.value)
    return

  const confirmation = await confirm(`Are you sure you want to delete "${selectedPreset.value.name}"?`)
  if (!confirmation)
    return

  const presets = settings.appearance.presets
  delete presets[selectedPreset.value.name]

  settings.appearance.presets = presets
  selectedPreset.value = null
}
</script>

<template>
  <div class="flex w-full items-center gap-2">
    <UDropdownMenuRoot>
      <UDropdownMenuTrigger as-child>
        <UButton variant="soft" class="w-full shrink justify-between">
          <span class="truncate">{{ selectedPreset?.name ?? 'Presets' }}</span> <Icon class="shrink-0" name="tabler:chevron-down" />
        </UButton>
      </UDropdownMenuTrigger>
      <UDropdownMenuContent class="w-full">
        <UDropdownMenuGroup v-if="presetArray.length">
          <UDropdownMenuItem
            v-for="preset in presetArray"
            :key="preset.name"
            @click="handlePresetClick(preset)"
          >
            {{ preset.name }}
          </UDropdownMenuItem>
        </UDropdownMenuGroup>
        <UDropdownMenuGroup v-else>
          <UDropdownMenuItem
            disabled
          >
            No presets found
          </UDropdownMenuItem>
        </UDropdownMenuGroup>
      </UDropdownMenuContent>
    </UDropdownMenuRoot>
    <UAlertDialogRoot v-model:open="dialogOpen">
      <UAlertDialogTrigger as-child>
        <UButton variant="soft">
          Save preset...
        </UButton>
      </UAlertDialogTrigger>
      <UAlertDialogContent>
        <VisuallyHidden>
          <UAlertDialogHeader>
            <UAlertDialogTitle>
              Save preset
            </UAlertDialogTitle>
          </UAlertDialogHeader>
        </VisuallyHidden>
        <UInput
          v-model="presetName"
          autofocus
          :maxlength="16"
          placeholder="Enter a name"
          @keyup.enter="handlePresetSave"
        />
        <UAlertDialogFooter class="flex w-full items-center">
          <UAlertDialogCancel as-child>
            <UButton variant="soft">
              Cancel
            </UButton>
          </UAlertDialogCancel>
          <UAlertDialogAction as-child>
            <UButton
              variant="soft"
              :disabled="presetName.length === 0"
              @click="handlePresetSave"
            >
              Save
            </UButton>
          </UAlertDialogAction>
        </UAlertDialogFooter>
      </UAlertDialogContent>
    </UAlertDialogRoot>
    <UDropdownMenuRoot>
      <UDropdownMenuTrigger as-child>
        <UButton
          :disabled="!selectedPreset"
          variant="soft"
          size="icon"
        >
          <Icon name="tabler:dots" />
        </UButton>
      </UDropdownMenuTrigger>
      <UDropdownMenuContent>
        <UDropdownMenuItem @click="handlePresetDelete">
          Delete "{{ selectedPreset?.name }}"...
        </UDropdownMenuItem>
        <!-- <UDropdownMenuItem
          @click="() => {
            alertDialogAction = 'rename'
            dialogOpen = true
          }"
        >
          Rename "{{ selectedPreset?.name }}"...
        </UDropdownMenuItem> -->
      </UDropdownMenuContent>
    </UDropdownMenuRoot>
  </div>
</template>
