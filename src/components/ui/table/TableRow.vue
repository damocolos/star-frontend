<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const delegatedProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <tr
    v-bind="delegatedProps"
    :class="
      cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', props.class)
    "
  >
    <slot />
  </tr>
</template>
