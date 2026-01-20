<script setup lang="ts">
import { DialogRoot, type DialogRootEmits, type DialogRootProps, useForwardPropsEmits } from 'radix-vue'
import { type HTMLAttributes, computed } from 'vue'

interface DialogProps extends DialogRootProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<DialogProps>()
const emits = defineEmits<DialogRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogRoot v-bind="forwarded">
    <slot />
  </DialogRoot>
</template>
