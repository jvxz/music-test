<template>
  <div>
    <UButton
      class="w-full justify-start text-foreground data-drag-over:bg-muted"
      variant="ghost"
      @click="navigateTo('/library')"
    >
      <Icon
        name="tabler:folder"
        class="size-4"
      />
      Library
    </UButton>
  </div>
</template>
