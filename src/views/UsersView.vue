<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { type CreateUserDto, type UpdateUserDto } from '@/services/users.service'
import { useUsersStore } from '@/stores/users'
import MainLayout from '@/components/layouts/MainLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Pencil, Trash2, Plus, Users as UsersIcon, UserCircle, Key } from 'lucide-vue-next'
import { formatDateTime } from '@/utils'

const usersStore = useUsersStore()
const users = computed(() => usersStore.users)
const isLoading = computed(() => usersStore.isLoading)
const isDialogOpen = ref(false)
const isEditing = ref(false)
const currentUser = ref<{ id: string; name: string; email: string; role?: string } | null>(null)
const isPasswordDialogOpen = ref(false)
const newPassword = ref('')

const formData = ref<CreateUserDto>({
  name: '',
  email: '',
  password: '',
  role: '',
})

const openCreateDialog = () => {
  isEditing.value = false
  currentUser.value = null
  formData.value = {
    name: '',
    email: '',
    password: '',
    role: 'basic',
  }
  isDialogOpen.value = true
}

const openEditDialog = (user: { id: string; name: string; email: string; role?: string }) => {
  isEditing.value = true
  currentUser.value = user
  formData.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role || 'basic',
  }
  isDialogOpen.value = true
}

const handleSubmit = async () => {
  try {
    if (isEditing.value && currentUser.value) {
      const updateData: UpdateUserDto = {
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role,
      }
      if (formData.value.password) {
        updateData.password = formData.value.password
      }
      await usersStore.updateUser(currentUser.value.id, updateData)
    } else {
      await usersStore.createUser(formData.value)
    }
    isDialogOpen.value = false
  } catch (error) {
    console.error('Failed to save user:', error)
  }
}

const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await usersStore.deleteUser(id)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }
}

const openPasswordDialog = (user: { id: string; name: string; email: string; role?: string }) => {
  currentUser.value = user
  newPassword.value = ''
  isPasswordDialogOpen.value = true
}

const handleChangePassword = async () => {
  if (!currentUser.value || !newPassword.value) return

  try {
    await usersStore.changePassword(currentUser.value.id, newPassword.value)
    isPasswordDialogOpen.value = false
    newPassword.value = ''
  } catch (error) {
    console.error('Failed to change password:', error)
  }
}

onMounted(() => {
  usersStore.fetchUsers()
})
</script>

<template>
  <MainLayout>
    <div class="min-h-screen py-8 px-4 pt-24">
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Users Management</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage user accounts and roles
            </p>
          </div>
          <Dialog v-model:open="isDialogOpen">
            <DialogTrigger as-child>
              <Button
                @click="openCreateDialog"
                class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg"
              >
                <Plus class="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent class="max-w-md">
              <DialogTitle>{{ isEditing ? 'Edit User' : 'Create User' }}</DialogTitle>
              <DialogDescription class="sr-only">
                {{
                  isEditing
                    ? 'Edit user information including name, email, password, and role'
                    : 'Create a new user account with name, email, password, and role'
                }}
              </DialogDescription>
              <form @submit.prevent="handleSubmit" class="space-y-4 mt-4">
                <div class="space-y-2">
                  <Label for="name">Name</Label>
                  <Input id="name" v-model="formData.name" required />
                </div>

                <div class="space-y-2">
                  <Label for="email">Email</Label>
                  <Input id="email" v-model="formData.email" type="email" required />
                </div>

                <div v-if="!isEditing" class="space-y-2">
                  <Label for="password">Password</Label>
                  <Input id="password" v-model="formData.password" type="password" required />
                </div>

                <div class="space-y-2">
                  <Label for="role">Role</Label>
                  <Select v-model="formData.role">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="flex gap-2 pt-4">
                  <Button type="submit" class="flex-1">
                    {{ isEditing ? 'Update' : 'Create' }}
                  </Button>
                  <Button type="button" variant="outline" @click="isDialogOpen = false">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <!-- Users List -->
        <div class="space-y-3">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-12">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
            ></div>
            <p class="mt-4 text-slate-500 dark:text-slate-400">Loading users...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="users.length === 0" class="text-center py-16">
            <div
              class="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800"
            >
              <UsersIcon class="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No users yet
            </h3>
            <p class="text-slate-500 dark:text-slate-400">Create your first user to get started!</p>
          </div>

          <!-- User Cards -->
          <div
            v-else
            v-for="user in users"
            :key="user.id"
            class="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 p-5"
          >
            <div class="flex items-start gap-4">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div
                  class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md"
                >
                  <UserCircle class="h-7 w-7 text-white" />
                </div>
              </div>

              <!-- User Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {{ user.name }}
                  </h3>
                  <Badge :variant="user.role === 'admin' ? 'default' : 'secondary'" class="text-xs">
                    {{ user.role || 'basic' }}
                  </Badge>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {{ user.email }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-500">
                  Joined {{ user.created_at ? formatDateTime(user.created_at) : 'N/A' }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  @click="openEditDialog(user)"
                  class="hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  @click="openPasswordDialog(user)"
                  class="hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-600 dark:hover:text-amber-400"
                >
                  <Key class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  @click="handleDelete(user.id)"
                  class="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- User Counter -->
        <div
          v-if="users.length > 0"
          class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400"
        >
          {{ users.length }} user{{ users.length !== 1 ? 's' : '' }} total
        </div>
      </div>

      <!-- Change Password Dialog -->
      <Dialog v-model:open="isPasswordDialogOpen">
        <DialogContent class="max-w-md">
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription> Change password for {{ currentUser?.name }} </DialogDescription>
          <form @submit.prevent="handleChangePassword" class="space-y-4 mt-4">
            <div class="space-y-2">
              <Label for="new-password">New Password</Label>
              <Input
                id="new-password"
                v-model="newPassword"
                type="password"
                required
                placeholder="Enter new password"
              />
            </div>

            <div class="flex gap-2 pt-4">
              <Button type="submit" class="flex-1" :disabled="!newPassword">
                Change Password
              </Button>
              <Button type="button" variant="outline" @click="isPasswordDialogOpen = false">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  </MainLayout>
</template>
