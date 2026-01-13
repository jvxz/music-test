<script lang="ts" setup>
import { breakpointsTailwind } from '@vueuse/core'

const fps = useFps()

const { active } = useBreakpoints(breakpointsTailwind)
const breakpoint = active()
</script>

<template>
  <div class="absolute top-2 right-2 text-xs text-muted-foreground" @click="$router.push('/playground')">
    {{ fps }}
    <span class="font-mono">{{ breakpoint }}</span>
  </div>
</template>
