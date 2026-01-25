import api from './api'

export interface User {
  id: string
  name: string
  email: string
  role?: string
  created_at?: string
  updated_at?: string
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  role?: string
}

export interface UpdateUserDto {
  name?: string
  email?: string
  password?: string
  role?: string
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

export const usersService = {
  async getAll(params?: {
    search?: string
    page?: number
    page_size?: number
  }): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append('search', params.search)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())

    const url = `/users${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await api.get<PaginatedResponse<User>>(url)
    return response.data
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`)
    return response.data.data
  },

  async create(userData: CreateUserDto): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', userData)
    return response.data.data
  },

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },

  async changePassword(id: string, newPassword: string): Promise<void> {
    await api.post(`/users/${id}/change-password`, { new_password: newPassword })
  },
}
