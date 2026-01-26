<script lang="ts" setup generic="T extends string">
withDefaults(defineProps<{
  disabled?: boolean
  values: T[]
  label: string
  sentenceCased?: boolean
}>(), {
  sentenceCased: true,
})

const modelValue = defineModel<T>()

const id = useId()
</script>

<template>
  <div
    v-if="modelValue"
    class="flex flex-col gap-2"
    v-bind="$attrs"
  >
    <ULabel :for="id" :disabled>
      {{ label }}
    </ULabel>
    <USelectRoot v-model:model-value="modelValue">
      <USelectTrigger>
        <USelectValue>
          {{ $props.sentenceCased ? sentenceCase(modelValue) : modelValue }}
        </USelectValue>
      </USelectTrigger>
      <USelectContent>
        <USelectItem
          v-for="value in values"
          :key="String(value)"
          :value
        >
          <USelectItemText>
            {{ $props.sentenceCased ? sentenceCase(value) : value }}
          </USelectItemText>
        </USelectItem>
      </USelectContent>
    </USelectRoot>
  </div>
</template>
