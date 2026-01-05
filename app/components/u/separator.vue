<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <Separator v-bind="delegatedProps" :class="cn('h-px bg-border', props.class)" />
</template>
