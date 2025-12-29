<template>
  <TabsRoot orientation="vertical" class="flex size-full items-center *:p-4">
    <TabsList class="flex w-[300px] shrink-0 flex-col gap-1 border-r *:justify-start">
      <TabsTrigger value="account" as-child>
        <UButton variant="ghost" class="w-full justify-start">
          Account
        </UButton>
      </TabsTrigger>
      <TabsTrigger value="appearance" as-child>
        <UButton variant="ghost" class="w-full justify-start">
          Appearance
        </UButton>
      </TabsTrigger>
    </TabsList>
    <TabsContent value="account" class="flex-1">
      test
    </TabsContent>
    <TabsContent value="appearance" class="flex-1">
      appearance
    </TabsContent>
  </TabsRoot>
  <UDialogFooter class="border-t p-4">
    <UButton disabled variant="soft">
      Apply
    </UButton>
    <UDialogClose as-child>
      <UButton variant="soft">
        Close
      </UButton>
    </UDialogClose>
  </UDialogFooter>
</template>
