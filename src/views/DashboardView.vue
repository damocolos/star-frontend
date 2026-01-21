<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import type { Task } from '@/services/tasks.service'
import MainLayout from '@/components/layouts/MainLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Trash2,
  Check,
  Circle,
  Plus,
  ListTodo,
  LayoutList,
  LayoutGrid,
  Play,
  Archive,
  Eye,
} from 'lucide-vue-next'

const tasksStore = useTasksStore()
const tasks = computed(() => tasksStore.tasks)
const isLoading = computed(() => tasksStore.isLoading)
const newTaskTitle = ref('')
const newTaskDescription = ref('')
const showDescription = ref(false)
const viewMode = ref<'list' | 'kanban'>('list')
const draggedTask = ref<Task | null>(null)
const dragOverColumn = ref<string | null>(null)
const isDetailModalOpen = ref(false)
const selectedTask = ref<Task | null>(null)
const editTaskTitle = ref('')
const editTaskDescription = ref('')

const tasksByStatus = computed(() => {
  return {
    pending: tasks.value.filter((t) => t.status === 'pending'),
    in_progress: tasks.value.filter((t) => t.status === 'in_progress'),
    completed: tasks.value.filter((t) => t.status === 'completed'),
    archived: tasks.value.filter((t) => t.status === 'archived'),
  }
})

const handleCreateTask = async () => {
  if (!newTaskTitle.value.trim()) return

  try {
    await tasksStore.createTask({
      title: newTaskTitle.value,
      description: newTaskDescription.value,
      status: 'pending',
      priority: 'medium',
    })
    newTaskTitle.value = ''
    newTaskDescription.value = ''
    showDescription.value = false
  } catch (error) {
    console.error('Failed to create task:', error)
  }
}

const handleToggleStatus = async (task: Task) => {
  try {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    await tasksStore.changeStatus(task.id, newStatus)
  } catch (error) {
    console.error('Failed to update task:', error)
  }
}

const handleDelete = async (id: string) => {
  try {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      await tasksStore.changeStatus(id, 'archived')
    }
  } catch (error) {
    console.error('Failed to delete task:', error)
  }
}

const handleStartTask = async (task: Task) => {
  try {
    await tasksStore.changeStatus(task.id, 'in_progress')
  } catch (error) {
    console.error('Failed to start task:', error)
  }
}

const handleArchiveTask = async (task: Task) => {
  try {
    await tasksStore.changeStatus(task.id, 'archived')
  } catch (error) {
    console.error('Failed to archive task:', error)
  }
}

const handleDragStart = (task: Task) => {
  draggedTask.value = task
}

const handleDragEnd = () => {
  draggedTask.value = null
  dragOverColumn.value = null
}

const handleDragOver = (e: DragEvent, status: string) => {
  e.preventDefault()
  dragOverColumn.value = status
}

const handleDragLeave = () => {
  dragOverColumn.value = null
}

const handleDrop = async (e: DragEvent, newStatus: string) => {
  e.preventDefault()
  dragOverColumn.value = null

  if (!draggedTask.value || draggedTask.value.status === newStatus) return

  await tasksStore.changeStatus(
    draggedTask.value.id,
    newStatus as 'pending' | 'in_progress' | 'completed' | 'archived',
  )
  draggedTask.value = null
}

const openTaskDetail = (task: Task) => {
  selectedTask.value = task
  editTaskTitle.value = task.title
  editTaskDescription.value = task.description || ''
  isDetailModalOpen.value = true
}

const handleSaveTask = async () => {
  if (!selectedTask.value || !editTaskTitle.value.trim()) return

  try {
    await tasksStore.updateTask(selectedTask.value.id, {
      title: editTaskTitle.value,
      description: editTaskDescription.value,
    })
    isDetailModalOpen.value = false
  } catch (error) {
    console.error('Failed to update task:', error)
  }
}

onMounted(() => {
  tasksStore.fetchTasks()
})
</script>

<template>
  <MainLayout>
    <div class="min-h-screen py-8 px-4 pt-24">
      <div class="max-w-7xl mx-auto">
        <!-- Task Input with View Toggle -->
        <div class="mb-8" :class="viewMode === 'list' ? 'max-w-3xl mx-auto' : ''">
          <!-- View Toggle -->
          <div class="flex justify-end mb-3">
            <div class="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <Button
                variant="ghost"
                size="sm"
                @click="viewMode = 'list'"
                :class="[
                  'rounded-lg transition-all mr-2',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 shadow-sm'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700',
                ]"
              >
                <LayoutList class="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="viewMode = 'kanban'"
                :class="[
                  'rounded-lg transition-all',
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-slate-700 shadow-sm'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700',
                ]"
              >
                <LayoutGrid class="h-4 w-4 mr-2" />
                Kanban
              </Button>
            </div>
          </div>

          <form @submit.prevent="handleCreateTask" class="space-y-3">
            <div class="relative">
              <Input
                v-model="newTaskTitle"
                type="text"
                placeholder="What needs to be done?"
                class="h-14 text-lg pl-6 pr-14 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
              />
              <Button
                type="submit"
                size="icon"
                class="absolute right-2 top-2 h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                :disabled="!newTaskTitle.trim()"
              >
                <Plus class="h-5 w-5" />
              </Button>
            </div>

            <!-- Toggle Description Button -->
            <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="showDescription = !showDescription"
              class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 h-8"
            >
              {{ showDescription ? 'Hide Description' : 'Add Description' }}
            </Button>

            <!-- Description Field -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <textarea
                v-if="showDescription"
                v-model="newTaskDescription"
                placeholder="Add description..."
                rows="3"
                class="w-full text-base px-6 py-3 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all resize-none focus:outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              ></textarea>
            </Transition>
          </form>
        </div>

        <!-- Tasks List/Kanban -->
        <div v-if="viewMode === 'list'" class="space-y-3 max-w-3xl mx-auto">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-12">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
            ></div>
            <p class="mt-4 text-slate-500 dark:text-slate-400">Loading tasks...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="tasks.length === 0" class="text-center py-16">
            <div
              class="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800"
            >
              <ListTodo class="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No tasks yet
            </h3>
            <p class="text-slate-500 dark:text-slate-400">Create your first task to get started!</p>
          </div>

          <!-- Task Items -->
          <div
            v-else
            v-for="task in tasks"
            :key="task.id"
            class="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 p-4"
          >
            <div class="flex items-start gap-4">
              <!-- Status Toggle Button -->
              <button @click="handleToggleStatus(task)" class="flex-shrink-0 mt-1 transition-all">
                <div
                  v-if="task.status === 'completed'"
                  class="w-6 h-6 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center shadow-sm"
                >
                  <Check class="h-4 w-4 text-white" />
                </div>
                <div
                  v-else
                  class="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <Circle class="h-5 w-5 text-transparent" />
                </div>
              </button>

              <!-- Task Content -->
              <div class="flex-1 min-w-0">
                <p
                  :class="[
                    'text-base font-medium transition-all',
                    task.status === 'completed'
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-900 dark:text-slate-100',
                  ]"
                >
                  {{ task.title }}
                </p>
                <p v-if="task.description" class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {{
                    task.description.length > 100
                      ? task.description.substring(0, 100) + '...'
                      : task.description
                  }}
                </p>
                <p v-if="task.user?.email" class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {{ task.user.email }}
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <Badge
                    v-if="task.priority && task.priority !== 'medium'"
                    :variant="task.priority === 'high' ? 'destructive' : 'outline'"
                    class="text-xs"
                  >
                    {{ task.priority }}
                  </Badge>
                  <Badge v-if="task.status === 'in_progress'" variant="secondary" class="text-xs">
                    In Progress
                  </Badge>
                  <Badge v-if="task.status === 'archived'" variant="outline" class="text-xs">
                    Archived
                  </Badge>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  @click="openTaskDetail(task)"
                  class="flex-shrink-0 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-400"
                >
                  <Eye class="h-4 w-4" />
                </Button>
                <Button
                  v-if="task.status === 'pending'"
                  variant="ghost"
                  size="icon"
                  @click="handleStartTask(task)"
                  class="flex-shrink-0 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Play class="h-4 w-4" />
                </Button>
                <Button
                  v-if="task.status === 'completed'"
                  variant="ghost"
                  size="icon"
                  @click="handleArchiveTask(task)"
                  class="flex-shrink-0 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-600 dark:hover:text-amber-400"
                >
                  <Archive class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  @click="handleDelete(task.id)"
                  class="flex-shrink-0 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Task Counter -->
          <div
            v-if="tasks.length > 0"
            class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400"
          >
            {{ tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived').length }}
            active task{{
              tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived').length !== 1
                ? 's'
                : ''
            }}
            of {{ tasks.length }} total
          </div>
        </div>

        <!-- Kanban Board -->
        <div v-else class="overflow-x-auto pb-4">
          <div class="grid grid-cols-4 gap-4 min-w-[1200px]">
            <!-- Pending Column -->
            <div
              class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 min-h-[500px] transition-colors"
              :class="{ 'bg-slate-100 dark:bg-slate-700': dragOverColumn === 'pending' }"
              @dragover="handleDragOver($event, 'pending')"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, 'pending')"
            >
              <h3
                class="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"
              >
                <Circle class="h-4 w-4" />
                Pending
                <Badge variant="secondary" class="ml-auto">{{
                  tasksByStatus.pending.length
                }}</Badge>
              </h3>
              <div class="space-y-3">
                <div
                  v-for="task in tasksByStatus.pending"
                  :key="task.id"
                  draggable="true"
                  @dragstart="handleDragStart(task)"
                  @dragend="handleDragEnd"
                  class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 cursor-move group"
                >
                  <p class="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    {{ task.title }}
                  </p>
                  <p
                    v-if="task.description"
                    class="text-sm text-slate-500 dark:text-slate-400 mb-2"
                  >
                    {{
                      task.description.length > 80
                        ? task.description.substring(0, 80) + '...'
                        : task.description
                    }}
                  </p>
                  <p
                    v-if="task.user?.email"
                    class="text-xs text-slate-400 dark:text-slate-500 mb-3"
                  >
                    {{ task.user.email }}
                  </p>
                  <div class="flex items-center gap-2">
                    <Badge
                      v-if="task.priority && task.priority !== 'medium'"
                      :variant="task.priority === 'high' ? 'destructive' : 'outline'"
                      class="text-xs"
                    >
                      {{ task.priority }}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="ml-auto h-8 w-8 opacity-0 group-hover:opacity-100"
                      @click.stop="openTaskDetail(task)"
                    >
                      <Eye class="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 opacity-0 group-hover:opacity-100"
                      @click="handleStartTask(task)"
                    >
                      <Play class="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- In Progress Column -->
            <div
              class="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 min-h-[500px] transition-colors"
              :class="{ 'bg-blue-100 dark:bg-blue-900/50': dragOverColumn === 'in_progress' }"
              @dragover="handleDragOver($event, 'in_progress')"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, 'in_progress')"
            >
              <h3
                class="font-semibold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2"
              >
                <Play class="h-4 w-4" />
                In Progress
                <Badge variant="secondary" class="ml-auto">{{
                  tasksByStatus.in_progress.length
                }}</Badge>
              </h3>
              <div class="space-y-3">
                <div
                  v-for="task in tasksByStatus.in_progress"
                  :key="task.id"
                  draggable="true"
                  @dragstart="handleDragStart(task)"
                  @dragend="handleDragEnd"
                  class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-blue-200 dark:border-blue-700 cursor-move"
                >
                  <p class="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    {{ task.title }}
                  </p>
                  <p
                    v-if="task.description"
                    class="text-sm text-slate-500 dark:text-slate-400 mb-2"
                  >
                    {{
                      task.description.length > 80
                        ? task.description.substring(0, 80) + '...'
                        : task.description
                    }}
                  </p>
                  <p
                    v-if="task.user?.email"
                    class="text-xs text-slate-400 dark:text-slate-500 mb-3"
                  >
                    {{ task.user.email }}
                  </p>
                  <div class="flex items-center gap-2">
                    <Badge
                      v-if="task.priority && task.priority !== 'medium'"
                      :variant="task.priority === 'high' ? 'destructive' : 'outline'"
                      class="text-xs"
                    >
                      {{ task.priority }}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="ml-auto h-8 w-8 opacity-0 group-hover:opacity-100"
                      @click.stop="openTaskDetail(task)"
                    >
                      <Eye class="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Completed Column -->
            <div
              class="bg-green-50 dark:bg-green-950/30 rounded-2xl p-4 min-h-[500px] transition-colors"
              :class="{ 'bg-green-100 dark:bg-green-900/50': dragOverColumn === 'completed' }"
              @dragover="handleDragOver($event, 'completed')"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, 'completed')"
            >
              <h3
                class="font-semibold text-green-700 dark:text-green-300 mb-4 flex items-center gap-2"
              >
                <Check class="h-4 w-4" />
                Completed
                <Badge variant="secondary" class="ml-auto">{{
                  tasksByStatus.completed.length
                }}</Badge>
              </h3>
              <div class="space-y-3">
                <div
                  v-for="task in tasksByStatus.completed"
                  :key="task.id"
                  draggable="true"
                  @dragstart="handleDragStart(task)"
                  @dragend="handleDragEnd"
                  class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-green-200 dark:border-green-700 cursor-move group"
                >
                  <p class="font-medium text-slate-900 dark:text-slate-100 mb-2 line-through">
                    {{ task.title }}
                  </p>
                  <p
                    v-if="task.description"
                    class="text-sm text-slate-500 dark:text-slate-400 mb-2"
                  >
                    {{
                      task.description.length > 80
                        ? task.description.substring(0, 80) + '...'
                        : task.description
                    }}
                  </p>
                  <p
                    v-if="task.user?.email"
                    class="text-xs text-slate-400 dark:text-slate-500 mb-3"
                  >
                    {{ task.user.email }}
                  </p>
                  <div class="flex items-center gap-2">
                    <Badge
                      v-if="task.priority && task.priority !== 'medium'"
                      :variant="task.priority === 'high' ? 'destructive' : 'outline'"
                      class="text-xs"
                    >
                      {{ task.priority }}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="ml-auto h-8 w-8 opacity-0 group-hover:opacity-100"
                      @click.stop="openTaskDetail(task)"
                    >
                      <Eye class="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 opacity-0 group-hover:opacity-100"
                      @click="handleArchiveTask(task)"
                    >
                      <Archive class="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Archived Column -->
            <div
              class="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 min-h-[500px] transition-colors"
              :class="{ 'bg-amber-100 dark:bg-amber-900/50': dragOverColumn === 'archived' }"
              @dragover="handleDragOver($event, 'archived')"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, 'archived')"
            >
              <h3
                class="font-semibold text-amber-700 dark:text-amber-300 mb-4 flex items-center gap-2"
              >
                <Archive class="h-4 w-4" />
                Archived
                <Badge variant="secondary" class="ml-auto">{{
                  tasksByStatus.archived.length
                }}</Badge>
              </h3>
              <div class="space-y-3">
                <div
                  v-for="task in tasksByStatus.archived"
                  :key="task.id"
                  draggable="true"
                  @dragstart="handleDragStart(task)"
                  @dragend="handleDragEnd"
                  class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-amber-200 dark:border-amber-700 cursor-move opacity-60"
                >
                  <p class="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    {{ task.title }}
                  </p>
                  <p
                    v-if="task.description"
                    class="text-sm text-slate-500 dark:text-slate-400 mb-2"
                  >
                    {{
                      task.description.length > 80
                        ? task.description.substring(0, 80) + '...'
                        : task.description
                    }}
                  </p>
                  <p
                    v-if="task.user?.email"
                    class="text-xs text-slate-400 dark:text-slate-500 mb-3"
                  >
                    {{ task.user.email }}
                  </p>
                  <div class="flex items-center gap-2">
                    <Badge
                      v-if="task.priority && task.priority !== 'medium'"
                      :variant="task.priority === 'high' ? 'destructive' : 'outline'"
                      class="text-xs"
                    >
                      {{ task.priority }}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="ml-auto h-8 w-8 opacity-0 group-hover:opacity-100"
                      @click.stop="openTaskDetail(task)"
                    >
                      <Eye class="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Detail Modal -->
      <Dialog v-model:open="isDetailModalOpen">
        <DialogContent class="max-w-2xl">
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription> View and edit task information </DialogDescription>
          <form @submit.prevent="handleSaveTask" class="space-y-4 mt-4">
            <div class="space-y-2">
              <Label for="task-title">Title</Label>
              <Input id="task-title" v-model="editTaskTitle" required placeholder="Task title" />
            </div>

            <div class="space-y-2">
              <Label for="task-description">Description</Label>
              <textarea
                id="task-description"
                v-model="editTaskDescription"
                placeholder="Task description..."
                rows="8"
                class="w-full text-base px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all resize-none focus:outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              ></textarea>
            </div>

            <div class="pt-4">
              <Button type="submit" class="w-full" :disabled="!editTaskTitle.trim()"> Save </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  </MainLayout>
</template>
