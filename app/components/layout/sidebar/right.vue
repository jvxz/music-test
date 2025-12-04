<template>
  <div class="flex flex-col *:p-4">
    <div class="border-b">
      <h3 class="text-lg font-medium">
        Now playing
      </h3>
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-1">
        <ULabel class="font-mono text-sm">
          title
        </ULabel>
        <UInput />
      </div>
      <div class="flex flex-col gap-1">
        <ULabel class="font-mono text-sm">
          artist
        </ULabel>
        <UInput />
      </div>
      <div class="flex flex-col gap-1">
        <ULabel class="font-mono text-sm">
          album
        </ULabel>
        <UInput />
      </div>
    </div>
  </div>
</template>
