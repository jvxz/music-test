<template>
  <div class="flex w-full flex-col gap-2">
    <FormSubtitle>
      UI
    </FormSubtitle>
    <FormPrimitive label="Scale">
      <UNumberFieldRoot
        v-model:model-value="$settings.appearance.ui.scale"
        class="w-48"
        :max="3"
        :min="0.25"
        :step="0.01"
        :format-options="{
          style: 'percent',
        }"
      >
        <UNumberFieldIncrement />
        <UNumberFieldInput />
        <UNumberFieldDecrement />
      </UNumberFieldRoot>
    </FormPrimitive>
    <FormPrimitive label="Spacing">
      <UNumberFieldRoot
        v-model:model-value="$settings.appearance.ui.spacing"
        class="w-48"
        :max="1"
        :min="0"
        :step="0.01"
        :format-options="{
          style: 'percent',
        }"
      >
        <UNumberFieldIncrement />
        <UNumberFieldInput />
        <UNumberFieldDecrement />
      </UNumberFieldRoot>
    </FormPrimitive>
    <FormPrimitive label="Corner radius">
      <UNumberFieldRoot
        v-model:model-value="$settings.appearance.ui.cornerRadius"
        class="w-48"
        :max="1"
        :min="0"
        :step="0.01"
        :format-options="{
          style: 'percent',
        }"
      >
        <UNumberFieldIncrement />
        <UNumberFieldInput />
        <UNumberFieldDecrement />
      </UNumberFieldRoot>
    </FormPrimitive>
  </div>
</template>
