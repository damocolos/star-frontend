import api from './api'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'archived'
  priority?: 'low' | 'medium' | 'high'
  user_id?: string
  due_date?: string
  created_at?: string
  updated_at?: string
  user?: {
    _id: string
    email: string
    name: string
  }
}

export interface CreateTaskDto {
  title: string
  description?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'archived'
  priority?: 'low' | 'medium' | 'high'
  user_id?: string
  due_date?: string
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'archived'
  priority?: 'low' | 'medium' | 'high'
  user_id?: string
  due_date?: string
}

export interface PaginationMetadata {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  metadata: PaginationMetadata
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

interface TaskWithMongoId extends Omit<Task, 'id'> {
  _id?: string
  id?: string
}

export const tasksService = {
  async getAll(params?: {
    search?: string
    page?: number
    page_size?: number
  }): Promise<PaginatedResponse<Task>> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append('search', params.search)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())

    const url = `/tasks${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await api.get<PaginatedResponse<Task>>(url)
    const result = response.data

    // Map _id to id if needed
    const tasks = result.data.map((task: TaskWithMongoId) => ({
      ...task,
      id: task.id || task._id || '',
    }))

    return {
      success: result.success,
      data: tasks,
      metadata: result.metadata,
    }
  },

  async getById(id: string): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`)
    const task = response.data.data as TaskWithMongoId
    return {
      ...task,
      id: task.id || task._id || '',
    }
  },

  async create(taskData: CreateTaskDto): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>('/tasks', taskData)
    const task = response.data.data as TaskWithMongoId
    return {
      ...task,
      id: task.id || task._id || '',
    }
  },

  async update(id: string, taskData: UpdateTaskDto): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, taskData)
    const task = response.data.data as TaskWithMongoId
    return {
      ...task,
      id: task.id || task._id || '',
    }
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },
}
