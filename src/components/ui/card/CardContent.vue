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
  <p v-bind="delegatedProps" :class="cn('p-6 pt-0', props.class)">
    <slot />
  </p>
</template>
