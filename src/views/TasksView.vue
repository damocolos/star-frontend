<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { type CreateTaskDto } from '@/services/tasks.service'
import { useTasksStore } from '@/stores/tasks'
import MainLayout from '@/components/layouts/MainLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'vue-sonner'
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
import { Pencil, Trash2, Plus, Search } from 'lucide-vue-next'

const tasksStore = useTasksStore()
const tasks = computed(() => tasksStore.tasks)
const metadata = computed(() => tasksStore.metadata)
const isLoading = computed(() => tasksStore.isLoading)
const isDialogOpen = ref(false)
const isEditing = ref(false)
const isDeleteDialogOpen = ref(false)
const taskToDelete = ref<string | null>(null)
const currentTask = ref<{
  id: string
  title: string
  description?: string
  status: string
  priority?: string
} | null>(null)

// Search and pagination
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const formData = ref<CreateTaskDto>({
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
})

const validationErrors = ref({
  title: '',
  description: '',
})

const titleCharCount = computed(() => formData.value.title.length)
const descriptionCharCount = computed(() => formData.value.description?.length || 0)

// Watch search query and debounce API calls
watch(searchQuery, (newValue) => {
  // Clear existing timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  // Reset to page 1 when search changes
  currentPage.value = 1

  // Only search if 3+ characters or empty (to show all)
  if (newValue.length === 0 || newValue.length >= 3) {
    searchDebounceTimer = setTimeout(() => {
      loadTasks()
    }, 500) // 500ms debounce
  }
})

const openCreateDialog = () => {
  isEditing.value = false
  currentTask.value = null
  formData.value = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
  }
  validationErrors.value = {
    title: '',
    description: '',
  }
  isDialogOpen.value = true
}

const openEditDialog = (task: {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
}) => {
  isEditing.value = true
  currentTask.value = task

  formData.value = {
    title: task.title,
    description: task.description || '',
    status: task.status as 'pending' | 'in_progress' | 'completed' | 'archived',
    priority: (task.priority || 'medium') as 'low' | 'medium' | 'high',
  }
  validationErrors.value = {
    title: '',
    description: '',
  }
  isDialogOpen.value = true
}

const handleSubmit = async () => {
  // Reset validation errors
  validationErrors.value = {
    title: '',
    description: '',
  }

  // Validate title
  if (!formData.value.title.trim()) {
    validationErrors.value.title = 'Title is required'
    return
  }
  if (formData.value.title.length > 50) {
    validationErrors.value.title = 'Title must not exceed 50 characters'
    return
  }

  // Validate description
  if (formData.value.description && formData.value.description.length > 1000) {
    validationErrors.value.description = 'Description must not exceed 1000 characters'
    return
  }

  try {
    if (isEditing.value && currentTask.value) {
      await tasksStore.updateTask(currentTask.value.id, formData.value)
      toast.success('Task updated successfully')
    } else {
      await tasksStore.createTask(formData.value)
      toast.success('Task created successfully')
    }
    isDialogOpen.value = false
    await loadTasks()
  } catch (error) {
    console.error('Failed to save task:', error)
    toast.error(isEditing.value ? 'Failed to update task' : 'Failed to create task')
  }
}

const handleDelete = (id: string) => {
  taskToDelete.value = id
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!taskToDelete.value) return

  try {
    await tasksStore.deleteTask(taskToDelete.value)
    toast.success('Task deleted successfully')
    await loadTasks()
    isDeleteDialogOpen.value = false
    taskToDelete.value = null
  } catch (error) {
    console.error('Failed to delete task:', error)
    toast.error('Failed to delete task')
  }
}

const cancelDelete = () => {
  isDeleteDialogOpen.value = false
  taskToDelete.value = null
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'default'
    case 'in_progress':
      return 'secondary'
    case 'archived':
      return 'destructive'
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

const loadTasks = async () => {
  // Only include search if it's empty or has 3+ characters
  const search = searchQuery.value.length >= 3 ? searchQuery.value : undefined

  await tasksStore.fetchTasks({
    search,
    page: currentPage.value,
    page_size: pageSize.value,
  })
}

const handleSearch = async () => {
  // Manual search button click - only search if 3+ chars or empty
  if (searchQuery.value.length === 0 || searchQuery.value.length >= 3) {
    currentPage.value = 1
    await loadTasks()
  }
}

const handlePageChange = async (page: number) => {
  currentPage.value = page
  await loadTasks()
}

const handlePageSizeChange = async (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  await loadTasks()
}

onMounted(() => {
  loadTasks()
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
                    ? 'Edit task information including title, description, status, and priority'
                    : 'Create a new task with title, description, status, and priority'
                }}
              </DialogDescription>
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <Label for="title">Title <span class="text-destructive">*</span></Label>
                    <span class="text-xs text-muted-foreground">{{ titleCharCount }}/50</span>
                  </div>
                  <Input
                    id="title"
                    v-model="formData.title"
                    maxlength="50"
                    :class="{ 'border-destructive': validationErrors.title }"
                  />
                  <p v-if="validationErrors.title" class="text-sm text-destructive">
                    {{ validationErrors.title }}
                  </p>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <Label for="description">Description</Label>
                    <span class="text-xs text-muted-foreground"
                      >{{ descriptionCharCount }}/1000</span
                    >
                  </div>
                  <textarea
                    id="description"
                    v-model="formData.description"
                    rows="3"
                    maxlength="1000"
                    :class="[
                      'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                      { 'border-destructive': validationErrors.description },
                    ]"
                  />
                  <p v-if="validationErrors.description" class="text-sm text-destructive">
                    {{ validationErrors.description }}
                  </p>
                </div>

                <div class="space-y-2">
                  <Label for="status">Status</Label>
                  <select
                    id="status"
                    v-model="formData.status"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
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
          <!-- Search Bar -->
          <div class="mb-4 space-y-2">
            <div class="flex gap-2">
              <div class="relative flex-1">
                <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  v-model="searchQuery"
                  placeholder="Search tasks (min 3 characters)..."
                  class="pl-8"
                  @keyup.enter="handleSearch"
                />
              </div>
              <Button @click="handleSearch" variant="outline"> Search </Button>
            </div>
            <p
              v-if="searchQuery.length > 0 && searchQuery.length < 3"
              class="text-xs text-muted-foreground"
            >
              Type at least 3 characters to search
            </p>
          </div>

          <div v-if="isLoading" class="text-center py-8">Loading...</div>

          <template v-else>
            <!-- Empty State -->
            <div v-if="tasks.length === 0" class="text-center py-12">
              <div class="text-muted-foreground">
                <template v-if="searchQuery.length >= 3">
                  <p class="text-lg font-medium">No tasks found</p>
                  <p class="text-sm mt-1">Try adjusting your search query</p>
                </template>
                <template v-else>
                  <p class="text-lg font-medium">No tasks yet</p>
                  <p class="text-sm mt-1">Create your first task to get started</p>
                </template>
              </div>
            </div>

            <!-- Desktop Table View -->
            <Table v-else class="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[8%]">ID</TableHead>
                  <TableHead class="w-[55%]">Task</TableHead>
                  <TableHead class="w-[12%]">Status</TableHead>
                  <TableHead class="w-[10%]">Priority</TableHead>
                  <TableHead class="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="task in tasks" :key="task?.id || Math.random()">
                  <TableCell class="w-[8%]">{{ task?.id }}</TableCell>
                  <TableCell class="w-[55%]">
                    <div class="space-y-1">
                      <div class="font-medium">{{ task?.title }}</div>
                      <div class="text-sm text-muted-foreground">
                        {{ task?.description || '-' }}
                      </div>
                      <div v-if="task?.user" class="text-xs text-muted-foreground mt-1">
                        {{ task.user.email }}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell class="w-[12%]">
                    <Badge
                      v-if="task?.status"
                      :variant="getStatusVariant(task.status)"
                      class="capitalize"
                    >
                      {{ task.status.replace('_', ' ') }}
                    </Badge>
                  </TableCell>
                  <TableCell class="w-[10%]">
                    <Badge
                      v-if="task?.priority"
                      :variant="getPriorityVariant(task.priority)"
                      class="capitalize"
                    >
                      {{ task.priority }}
                    </Badge>
                    <Badge v-else variant="outline">medium</Badge>
                  </TableCell>
                  <TableCell class="w-[15%] text-right">
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

            <!-- Mobile Card View -->
            <div v-if="tasks.length > 0" class="md:hidden space-y-4">
              <Card v-for="task in tasks" :key="task?.id || Math.random()" class="p-4">
                <div class="space-y-3">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="text-xs text-muted-foreground mb-1">ID: {{ task?.id }}</div>
                      <div class="font-medium">{{ task?.title }}</div>
                      <div class="text-sm text-muted-foreground mt-1">
                        {{ task?.description || '-' }}
                      </div>
                      <div v-if="task?.user" class="text-xs text-muted-foreground mt-1">
                        {{ task.user.email }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge
                      v-if="task?.status"
                      :variant="getStatusVariant(task.status)"
                      class="capitalize"
                    >
                      {{ task.status.replace('_', ' ') }}
                    </Badge>
                    <Badge
                      v-if="task?.priority"
                      :variant="getPriorityVariant(task.priority)"
                      class="capitalize"
                    >
                      {{ task.priority }}
                    </Badge>
                    <Badge v-else variant="outline">medium</Badge>
                  </div>
                  <div v-if="task" class="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      class="flex-1"
                      @click="openEditDialog(task)"
                    >
                      <Pencil class="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      class="flex-1"
                      @click="handleDelete(task.id)"
                    >
                      <Trash2 class="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </template>

          <!-- Pagination -->
          <div
            v-if="!isLoading"
            class="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div class="text-sm text-muted-foreground">
                Showing {{ (metadata.page - 1) * metadata.page_size + 1 }} to
                {{ Math.min(metadata.page * metadata.page_size, metadata.total_items) }}
                of {{ metadata.total_items }} results
              </div>
              <div class="flex items-center gap-2">
                <label class="text-sm text-muted-foreground">Per page:</label>
                <select
                  v-model.number="pageSize"
                  @change="handlePageSizeChange(pageSize)"
                  class="h-8 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                </select>
              </div>
            </div>
            <div class="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                :disabled="metadata.page === 1"
                @click="handlePageChange(metadata.page - 1)"
              >
                Previous
              </Button>
              <div class="flex items-center gap-1">
                <Button
                  v-for="page in Math.min(metadata.total_pages, 5)"
                  :key="page"
                  variant="outline"
                  size="sm"
                  :class="{ 'bg-primary text-primary-foreground': page === metadata.page }"
                  @click="handlePageChange(page)"
                >
                  {{ page }}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                :disabled="metadata.page === metadata.total_pages"
                @click="handlePageChange(metadata.page + 1)"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this task? This action cannot be undone.
        </DialogDescription>
        <div class="flex justify-end gap-2 mt-4">
          <Button variant="outline" @click="cancelDelete"> Cancel </Button>
          <Button variant="destructive" @click="confirmDelete"> Delete </Button>
        </div>
      </DialogContent>
    </Dialog>
  </MainLayout>
</template>
