<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import {
  CalendarRoot,
  type CalendarRootEmits,
  type CalendarRootProps,
  useForwardPropsEmits,
} from 'radix-vue'
import { cn } from '@/utils'

const props = defineProps<
  CalendarRootProps & {
    class?: HTMLAttributes['class']
  }
>()

const emits = defineEmits<CalendarRootEmits>()

const delegatedProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CalendarRoot v-bind="forwarded" :class="cn('p-3', props.class)">
    <slot />
  </CalendarRoot>
</template>
