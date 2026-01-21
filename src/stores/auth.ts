import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type LoginCredentials } from '@/services/auth.service'
import { useTasksStore } from './tasks'
import { useUsersStore } from './users'

interface User {
  id: number
  email: string
  name: string
  role?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(JSON.parse(localStorage.getItem('auth_user') || 'null'))
  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials: LoginCredentials) {
    try {
      const response = await authService.login(credentials)
      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('auth_user', JSON.stringify(response.data.user))
      return response
    } catch (error) {
      throw error
    }
  }

  async function logout() {
    // Reset all stores
    const tasksStore = useTasksStore()
    const usersStore = useUsersStore()

    tasksStore.resetStore()
    usersStore.resetStore()

    // Clear auth data
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  function checkAuth() {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    } else {
      token.value = null
      user.value = null
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }
})
