<script lang="ts" setup generic="T">
defineProps<{
  // require ref for vue-draggable-plus
  // eslint-disable-next-line vue/no-reserved-props
  ref: any
}>()

// const listEl = shallowRef<HTMLElement | null>(null)
// useDraggable(listEl, modelValue, {
//   ...props,
//   animation: props.animation ?? 0,
//   fallbackOnBody: true,
//   forceFallback: true,
//   // group: props.sourceOnly
//   //   ? {
//   //       ...(props.group as GroupOptions),
//   //       pull: 'clone',
//   //       put: false,
//   //     }
//   //   : props.group,
//   // sort: props.sourceOnly ? false : (props.sort ?? true),
// })
</script>

<template>
  <div v-bind="$props">
    <slot />
  </div>
</template>
