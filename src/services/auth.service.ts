import api from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  data: {
    token: string
    user: {
      id: number
      email: string
      name: string
    }
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },
}
