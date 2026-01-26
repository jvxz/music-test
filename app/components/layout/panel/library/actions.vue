<template>
  <div>
    <UButton
      :class="cn('w-full justify-start text-foreground data-drag-over:bg-muted', $route.name === 'library' && 'ghost-button-active')"
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
