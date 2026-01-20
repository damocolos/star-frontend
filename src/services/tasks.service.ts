import api from './api'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  user_id?: string
  due_date?: string
  created_at?: string
  updated_at?: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  status?: 'pending' | 'in-progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  user_id?: string
  due_date?: string
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: 'pending' | 'in-progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  user_id?: string
  due_date?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const tasksService = {
  async getAll(): Promise<Task[]> {
    const response = await api.get<ApiResponse<Task[]>>('/tasks')
    return response.data.data
  },

  async getById(id: string): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`)
    return response.data.data
  },

  async create(taskData: CreateTaskDto): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>('/tasks', taskData)
    return response.data.data
  },

  async update(id: string, taskData: UpdateTaskDto): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, taskData)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },
}
