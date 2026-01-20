<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <h2
    v-bind="delegatedProps"
    :class="cn('text-2xl font-semibold leading-none tracking-tight', props.class)"
  >
    <slot />
  </h2>
</template>
