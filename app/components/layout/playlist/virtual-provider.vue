<script lang="ts" setup>
const props = defineProps<{
  entries: FileEntry[]
}>()

const { containerProps, list, wrapperProps } = useVirtualList(computed(() => props.entries), {
  itemHeight: 34,
  overscan: 8,
})
</script>

<template>
  <slot
    :container-props="containerProps"
    :list="list"
    :wrapper-props="wrapperProps"
  />
</template>
