<script lang="ts" setup>
const libraryButtons = [
  {
    icon: 'tabler:playlist',
    name: 'Playlists',
    slug: 'playlists',
  },
  {
    icon: 'tabler:music',
    name: 'Tracks',
    slug: 'tracks',
  },
  {
    icon: 'tabler:user',
    name: 'Artists',
    slug: 'artists',
  },
] as const
</script>

<template>
  <div class="flex size-full flex-col gap-1">
    <UContextMenu
      v-for="button in libraryButtons"
      :key="button.slug"
    >
      <UContextMenuTrigger as-child>
        <CollapsibleRoot>
          <CollapsibleTrigger as-child>
            <UButton
              variant="ghost"
              class="group w-full justify-start"
            >
              <Icon name="tabler:chevron-right" class="size-4 group-data-[state=open]:rotate-90" />
              <Icon
                name="tabler:folder"
                class="size-4"
              />
              <span>{{ button.name }}</span>
            </UButton>
          </CollapsibleTrigger>
          <CollapsibleContent class="overflow-hidden pl-4.5 data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down">
            <div class="p-1">
              <UButton
                v-for="i in 3"
                :key="i"
                variant="ghost"
                class="w-full justify-start"
              >
                <Icon :name="button.icon" class="size-4" />
                {{ button.name }}
              </UButton>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>
      </UContextMenuTrigger>
      <UContextMenuContent>
        <UContextMenuItem>
          Delete
        </UContextMenuItem>
        <UContextMenuItem>
          Rename
        </UContextMenuItem>
        <UContextMenuItem>
          Duplicate
        </UContextMenuItem>
      </UContextMenuContent>
    </UContextMenu>
  </div>
</template>
