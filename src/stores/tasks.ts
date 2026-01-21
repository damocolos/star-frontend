import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  tasksService,
  type Task,
  type CreateTaskDto,
  type UpdateTaskDto,
} from '@/services/tasks.service'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const lastFetched = ref(0)
  const ttl = ref(10_000) // 10 seconds

  const getTasks = computed(() => tasks.value)
  const isStale = computed(() => {
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetched.value
    const stale = timeSinceLastFetch > ttl.value
    return stale
  })

  const fetchTasks = async (force = false) => {
    const currentIsStale = isStale.value
    const shouldFetch = force || !isInitialized.value || currentIsStale

    if (shouldFetch) {
      isLoading.value = true
      try {
        tasks.value = await tasksService.getAll()
        isInitialized.value = true
        lastFetched.value = Date.now()
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
        throw error
      } finally {
        isLoading.value = false
      }
    }
    return tasks.value
  }

  const createTask = async (data: CreateTaskDto) => {
    try {
      const newTask = await tasksService.create(data)
      tasks.value.unshift(newTask)
      return newTask
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error
    }
  }

  const updateTask = async (id: string, data: UpdateTaskDto) => {
    try {
      const updatedTask = await tasksService.update(id, data)
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      return updatedTask
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await tasksService.delete(id)
      tasks.value = tasks.value.filter((t) => t.id !== id)
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  }

  const changeStatus = async (
    id: string,
    status: 'pending' | 'in_progress' | 'completed' | 'archived',
  ) => {
    try {
      const updatedTask = await tasksService.changeStatus(id, status)
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      return updatedTask
    } catch (error) {
      console.error('Failed to change task status:', error)
      throw error
    }
  }

  const refresh = () => fetchTasks(true)

  const resetStore = () => {
    tasks.value = []
    isLoading.value = false
    isInitialized.value = false
    lastFetched.value = 0
  }

  return {
    tasks: getTasks,
    isLoading,
    isInitialized,
    isStale,
    lastFetched,
    ttl,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
    refresh,
    resetStore,
  }
})
