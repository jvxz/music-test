<script lang="ts" setup>
defineProps<{
  disabled?: boolean
  label: string
}>()

const id = useId()

const modelValue = defineModel<boolean>()
</script>

<template>
  <div class="flex items-center gap-2" v-bind="$attrs">
    <UCheckbox
      :id
      v-model:model-value="modelValue"
      :disabled
    />
    <ULabel :for="id" :disabled>
      {{ label }}
    </ULabel>
  </div>
</template>
