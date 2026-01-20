<script setup lang="ts">
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
  type CalendarRootEmits,
  type CalendarRootProps,
  useForwardPropsEmits,
} from 'radix-vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/utils'

const props = defineProps<
  CalendarRootProps & {
    class?: HTMLAttributes['class']
  }
>()

const emits = defineEmits<CalendarRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <div :class="cn('p-3', props.class)">
    <CalendarRoot v-slot="{ grid, weekDays }" v-bind="forwarded">
      <CalendarHeader>
        <CalendarPrev
          class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent p-0 opacity-50 hover:opacity-100"
        >
          <ChevronLeft class="h-4 w-4" />
        </CalendarPrev>
        <CalendarHeading class="text-sm font-medium" />
        <CalendarNext
          class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent p-0 opacity-50 hover:opacity-100"
        >
          <ChevronRight class="h-4 w-4" />
        </CalendarNext>
      </CalendarHeader>

      <div class="mt-4 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
        <CalendarGrid v-for="month in grid" :key="month.value.toString()" class="w-full">
          <CalendarGridHead>
            <CalendarGridRow class="flex">
              <CalendarHeadCell
                v-for="day in weekDays"
                :key="day"
                class="w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground"
              >
                {{ day }}
              </CalendarHeadCell>
            </CalendarGridRow>
          </CalendarGridHead>
          <CalendarGridBody>
            <CalendarGridRow
              v-for="(weekDates, index) in month.rows"
              :key="`weekDate-${index}`"
              class="mt-2 flex w-full"
            >
              <CalendarCell
                v-for="weekDate in weekDates"
                :key="weekDate.toString()"
                :date="weekDate"
                class="relative h-8 w-8 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([data-selected])]:bg-accent [&:has([data-selected][data-outside-month])]:bg-accent/50"
              >
                <CalendarCellTrigger
                  :day="weekDate"
                  :month="month.value"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[disabled]:text-muted-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:opacity-100 data-[unavailable]:text-destructive data-[unavailable]:line-through data-[outside-month]:pointer-events-none data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50 [&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground"
                />
              </CalendarCell>
            </CalendarGridRow>
          </CalendarGridBody>
        </CalendarGrid>
      </div>
    </CalendarRoot>
  </div>
</template>
