<template>
  <div class="flex h-full flex-col gap-4 *:px-4 *:first:pt-4 *:last:pb-4">
    <LayoutLibraryActions />
    <UContextMenu>
      <UContextMenuTrigger as-child>
        <LayoutLibraryList />
      </UContextMenuTrigger>
      <UContextMenuContent>
        <UContextMenuItem>
          <Icon name="tabler:playlist-add" class="size-4" />
          New playlist
        </UContextMenuItem>
        <UContextMenuItem>
          <Icon name="tabler:folder-plus" class="size-4" />
          New folder
        </UContextMenuItem>
      </UContextMenuContent>
    </UContextMenu>
  </div>
</template>
