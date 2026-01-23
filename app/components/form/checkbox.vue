<script lang="ts" setup>
defineProps<{
  id: string
  label: string
}>()

const modelValue = defineModel<boolean>()
</script>

<template>
  <div class="flex items-center gap-2" v-bind="$attrs">
    <UCheckbox :id v-model:model-value="modelValue" />
    <ULabel for="roundedCorners">
      Rounded corners
    </ULabel>
  </div>
</template>
