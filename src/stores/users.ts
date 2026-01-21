import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  usersService,
  type User,
  type CreateUserDto,
  type UpdateUserDto,
} from '@/services/users.service'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const lastFetched = ref(0)
  const ttl = ref(10_000) // 10 seconds

  const getUsers = computed(() => users.value)
  const isStale = computed(() => {
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetched.value
    const stale = timeSinceLastFetch > ttl.value
    return stale
  })

  const fetchUsers = async (force = false) => {
    const currentIsStale = isStale.value
    const shouldFetch = force || !isInitialized.value || currentIsStale

    if (shouldFetch) {
      isLoading.value = true
      try {
        users.value = await usersService.getAll()
        isInitialized.value = true
        lastFetched.value = Date.now()
      } catch (error) {
        console.error('Failed to fetch users:', error)
        throw error
      } finally {
        isLoading.value = false
      }
    }
    return users.value
  }

  const createUser = async (data: CreateUserDto) => {
    try {
      const newUser = await usersService.create(data)
      users.value.push(newUser)
      return newUser
    } catch (error) {
      console.error('Failed to create user:', error)
      throw error
    }
  }

  const updateUser = async (id: string, data: UpdateUserDto) => {
    try {
      const updatedUser = await usersService.update(id, data)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      return updatedUser
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await usersService.delete(id)
      users.value = users.value.filter((u) => u.id !== id)
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  }

  const changePassword = async (id: string, newPassword: string) => {
    try {
      await usersService.changePassword(id, newPassword)
    } catch (error) {
      console.error('Failed to change password:', error)
      throw error
    }
  }

  const refresh = () => fetchUsers(true)

  const resetStore = () => {
    users.value = []
    isLoading.value = false
    isInitialized.value = false
    lastFetched.value = 0
  }

  return {
    users: getUsers,
    isLoading,
    isInitialized,
    isStale,
    lastFetched,
    ttl,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    refresh,
    resetStore,
  }
})
