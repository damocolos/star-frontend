<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { type CreateTaskDto } from '@/services/tasks.service'
import { useTasksStore } from '@/stores/tasks'
import MainLayout from '@/components/layouts/MainLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/calendar'
import { formatDateTime } from '@/utils'
import { CalendarIcon, Pencil, Trash2, Plus } from 'lucide-vue-next'
import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date'

const tasksStore = useTasksStore()
const tasks = computed(() => tasksStore.tasks)
const isLoading = computed(() => tasksStore.isLoading)
const isDialogOpen = ref(false)
const isEditing = ref(false)
const currentTask = ref<{
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  due_date?: string
} | null>(null)
const selectedDate = ref<DateValue | undefined>()

const formData = ref<CreateTaskDto>({
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
})

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

const formattedDate = computed(() => {
  if (!selectedDate.value) return 'Pick a date'
  return df.format(selectedDate.value.toDate(getLocalTimeZone()))
})

const openCreateDialog = () => {
  isEditing.value = false
  currentTask.value = null
  selectedDate.value = undefined
  formData.value = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
  }
  isDialogOpen.value = true
}

const openEditDialog = (task: {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  due_date?: string
}) => {
  isEditing.value = true
  currentTask.value = task

  // Parse due_date if it exists
  if (task.due_date) {
    try {
      const date = new Date(task.due_date)
      selectedDate.value = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        toDate: () => date,
      } as DateValue
    } catch {
      selectedDate.value = undefined
    }
  } else {
    selectedDate.value = undefined
  }

  formData.value = {
    title: task.title,
    description: task.description || '',
    status: task.status as 'pending' | 'in_progress' | 'completed' | 'archived',
    priority: (task.priority || 'medium') as 'low' | 'medium' | 'high',
  }
  isDialogOpen.value = true
}

const handleSubmit = async () => {
  try {
    const taskData = {
      ...formData.value,
      due_date: selectedDate.value
        ? selectedDate.value.toDate(getLocalTimeZone()).toISOString()
        : undefined,
    }

    if (isEditing.value && currentTask.value) {
      await tasksStore.updateTask(currentTask.value.id, taskData)
    } else {
      await tasksStore.createTask(taskData)
    }
    isDialogOpen.value = false
  } catch (error) {
    console.error('Failed to save task:', error)
  }
}

const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this task?')) {
    try {
      await tasksStore.deleteTask(id)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'default'
    case 'in-progress':
      return 'secondary'
    default:
      return 'outline'
  }
}

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'secondary'
    default:
      return 'outline'
  }
}

onMounted(() => {
  tasksStore.fetchTasks()
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto py-8">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>Tasks Management</CardTitle>
          <Dialog v-model:open="isDialogOpen">
            <DialogTrigger as-child>
              <Button @click="openCreateDialog">
                <Plus class="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>{{ isEditing ? 'Edit Task' : 'Create Task' }}</DialogTitle>
              <DialogDescription class="sr-only">
                {{
                  isEditing
                    ? 'Edit task information including title, description, status, priority, and due date'
                    : 'Create a new task with title, description, status, priority, and due date'
                }}
              </DialogDescription>
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="space-y-2">
                  <Label for="title">Title</Label>
                  <Input id="title" v-model="formData.title" required />
                </div>

                <div class="space-y-2">
                  <Label for="description">Description</Label>
                  <Input id="description" v-model="formData.description" />
                </div>

                <div class="space-y-2">
                  <Label for="status">Status</Label>
                  <select
                    id="status"
                    v-model="formData.status"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <Label for="priority">Priority</Label>
                  <select
                    id="priority"
                    v-model="formData.priority"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger as-child>
                      <Button
                        variant="outline"
                        :class="{
                          'w-full justify-start text-left font-normal': true,
                          'text-muted-foreground': !selectedDate,
                        }"
                      >
                        <CalendarIcon class="mr-2 h-4 w-4" />
                        {{ formattedDate }}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0">
                      <RangeCalendar v-model="selectedDate" initial-focus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div class="flex justify-end gap-2">
                  <Button type="button" variant="outline" @click="isDialogOpen = false">
                    Cancel
                  </Button>
                  <Button type="submit">
                    {{ isEditing ? 'Update' : 'Create' }}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div v-if="isLoading" class="text-center py-8">Loading...</div>
          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="task in tasks" :key="task?.id || Math.random()">
                <TableCell>{{ task?.id }}</TableCell>
                <TableCell class="font-medium">{{ task?.title }}</TableCell>
                <TableCell>{{ task?.description || '-' }}</TableCell>
                <TableCell>
                  <Badge
                    v-if="task?.status"
                    :variant="getStatusVariant(task.status)"
                    class="capitalize"
                  >
                    {{ task.status.replace('-', ' ') }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    v-if="task?.priority"
                    :variant="getPriorityVariant(task.priority)"
                    class="capitalize"
                  >
                    {{ task.priority }}
                  </Badge>
                  <Badge v-else variant="outline">medium</Badge>
                </TableCell>
                <TableCell>{{ task?.due_date ? formatDateTime(task.due_date) : '-' }}</TableCell>
                <TableCell class="text-right">
                  <div v-if="task" class="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      @click="openEditDialog(task)"
                      aria-label="Edit task"
                    >
                      <Pencil class="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      @click="handleDelete(task.id)"
                      aria-label="Delete task"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </MainLayout>
</template>
