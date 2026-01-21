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

interface ApiResponse<T> {
  success: boolean
  data: T
}

interface TaskWithMongoId extends Omit<Task, 'id'> {
  _id?: string
  id?: string
}

export const tasksService = {
  async getAll(): Promise<Task[]> {
    const response = await api.get<ApiResponse<Task[]>>('/tasks')
    const data = response.data.data
    const tasks = Array.isArray(data) ? data : []
    // Map _id to id if needed
    return tasks.map((task: TaskWithMongoId) => ({
      ...task,
      id: task.id || task._id || '',
    }))
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

  async changeStatus(
    id: string,
    status: 'pending' | 'in_progress' | 'completed' | 'archived',
  ): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status-change`, { status })
    const task = response.data.data as TaskWithMongoId
    return {
      ...task,
      id: task.id || task._id || '',
    }
  },
}
