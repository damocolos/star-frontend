<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { type CreateUserDto, type UpdateUserDto } from '@/services/users.service'
import { useUsersStore } from '@/stores/users'
import MainLayout from '@/components/layouts/MainLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'vue-sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Pencil, Trash2, Plus, Key, Search } from 'lucide-vue-next'
import { formatDateTime } from '@/utils'

const usersStore = useUsersStore()
const users = computed(() => usersStore.users)
const metadata = computed(() => usersStore.metadata)
const isLoading = computed(() => usersStore.isLoading)
const isDialogOpen = ref(false)
const isEditing = ref(false)
const currentUser = ref<{ id: string; name: string; email: string; role?: string } | null>(null)
const isPasswordDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const userToDelete = ref<string | null>(null)
const newPassword = ref('')

// Pagination and search
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const formData = ref<CreateUserDto>({
  name: '',
  email: '',
  password: '',
  role: '',
})

// Watch search query and debounce API calls
watch(searchQuery, (newValue) => {
  // Clear existing timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  // Reset to page 1 when search changes
  currentPage.value = 1

  // Only search if 3+ characters or empty (to show all)
  if (newValue.length === 0 || newValue.length >= 3) {
    searchDebounceTimer = setTimeout(() => {
      loadUsers()
    }, 500) // 500ms debounce
  }
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

const loadUsers = async () => {
  // Only include search if it's empty or has 3+ characters
  const search = searchQuery.value.length >= 3 ? searchQuery.value : undefined

  await usersStore.fetchUsers({
    search,
    page: currentPage.value,
    page_size: pageSize.value,
  })
}

const handleSearch = async () => {
  // Manual search button click - only search if 3+ chars or empty
  if (searchQuery.value.length === 0 || searchQuery.value.length >= 3) {
    currentPage.value = 1
    await loadUsers()
  }
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
      toast.success('User updated successfully')
    } else {
      await usersStore.createUser(formData.value)
      toast.success('User created successfully')
    }
    isDialogOpen.value = false
    await loadUsers()
  } catch (error) {
    console.error('Failed to save user:', error)
    toast.error(isEditing.value ? 'Failed to update user' : 'Failed to create user')
  }
}

const handleDelete = (id: string) => {
  userToDelete.value = id
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!userToDelete.value) return

  try {
    await usersStore.deleteUser(userToDelete.value)
    toast.success('User deleted successfully')
    await loadUsers()
    isDeleteDialogOpen.value = false
    userToDelete.value = null
  } catch (error) {
    console.error('Failed to delete user:', error)
    toast.error('Failed to delete user')
  }
}

const cancelDelete = () => {
  isDeleteDialogOpen.value = false
  userToDelete.value = null
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
    toast.success('Password changed successfully')
    isPasswordDialogOpen.value = false
    newPassword.value = ''
  } catch (error) {
    console.error('Failed to change password:', error)
    toast.error('Failed to change password')
  }
}

const handlePageChange = async (page: number) => {
  currentPage.value = page
  await loadUsers()
}

const handlePageSizeChange = async (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  await loadUsers()
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto py-8">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>Users Management</CardTitle>
          <Dialog v-model:open="isDialogOpen">
            <DialogTrigger as-child>
              <Button @click="openCreateDialog">
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
        </CardHeader>
        <CardContent>
          <!-- Search Bar -->
          <div class="mb-4 space-y-2">
            <div class="flex gap-2">
              <div class="relative flex-1">
                <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  v-model="searchQuery"
                  placeholder="Search users (min 3 characters)..."
                  class="pl-8"
                  @keyup.enter="handleSearch"
                />
              </div>
              <Button @click="handleSearch" variant="outline"> Search </Button>
            </div>
            <p
              v-if="searchQuery.length > 0 && searchQuery.length < 3"
              class="text-xs text-muted-foreground"
            >
              Type at least 3 characters to search
            </p>
          </div>

          <!-- Users Table -->
          <div v-if="isLoading" class="text-center py-8">Loading...</div>

          <template v-else>
            <!-- Empty State -->
            <div v-if="users.length === 0" class="text-center py-12">
              <div class="text-muted-foreground">
                <template v-if="searchQuery.length >= 3">
                  <p class="text-lg font-medium">No users found</p>
                  <p class="text-sm mt-1">Try adjusting your search query</p>
                </template>
                <template v-else>
                  <p class="text-lg font-medium">No users yet</p>
                  <p class="text-sm mt-1">Create your first user to get started</p>
                </template>
              </div>
            </div>

            <!-- Desktop Table View -->
            <Table v-else class="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[14%]">ID</TableHead>
                  <TableHead class="w-[43%]">User</TableHead>
                  <TableHead class="w-[14%]">Role</TableHead>
                  <TableHead class="w-[14%]">Created At</TableHead>
                  <TableHead class="w-[14%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="user in users" :key="user.id">
                  <TableCell class="w-[14%]">{{ user.id }}</TableCell>
                  <TableCell class="w-[43%]">
                    <div class="space-y-1">
                      <div class="font-medium">{{ user.name }}</div>
                      <div class="text-sm text-muted-foreground">{{ user.email }}</div>
                    </div>
                  </TableCell>
                  <TableCell class="w-[14%]">
                    <Badge
                      :variant="user.role === 'admin' ? 'default' : 'secondary'"
                      class="capitalize"
                    >
                      {{ user.role || 'basic' }}
                    </Badge>
                  </TableCell>
                  <TableCell class="w-[14%]">{{
                    user.created_at ? formatDateTime(user.created_at) : '-'
                  }}</TableCell>
                  <TableCell class="w-[14%] text-right">
                    <div v-if="user" class="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        @click="openEditDialog(user)"
                        aria-label="Edit user"
                      >
                        <Pencil class="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        @click="openPasswordDialog(user)"
                        aria-label="Change password"
                      >
                        <Key class="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        @click="handleDelete(user.id)"
                        aria-label="Delete user"
                      >
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <!-- Mobile Card View -->
            <div v-if="users.length > 0" class="md:hidden space-y-4">
              <Card v-for="user in users" :key="user.id" class="p-4">
                <div class="space-y-3">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="text-xs text-muted-foreground mb-1">ID: {{ user.id }}</div>
                      <div class="font-medium text-lg">{{ user.name }}</div>
                      <div class="text-sm text-muted-foreground mt-1">{{ user.email }}</div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <Badge
                      :variant="user.role === 'admin' ? 'default' : 'secondary'"
                      class="capitalize"
                    >
                      {{ user.role || 'basic' }}
                    </Badge>
                    <div class="text-xs text-muted-foreground">
                      {{ user.created_at ? formatDateTime(user.created_at) : '-' }}
                    </div>
                  </div>
                  <div v-if="user" class="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      class="flex-1"
                      @click="openEditDialog(user)"
                    >
                      <Pencil class="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      class="flex-1"
                      @click="openPasswordDialog(user)"
                    >
                      <Key class="h-4 w-4 mr-2" />
                      Password
                    </Button>
                    <Button size="sm" variant="destructive" @click="handleDelete(user.id)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </template>

          <!-- Pagination -->
          <div
            v-if="!isLoading"
            class="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div class="text-sm text-slate-500 dark:text-slate-400">
                Showing {{ (metadata.page - 1) * metadata.page_size + 1 }} to
                {{ Math.min(metadata.page * metadata.page_size, metadata.total_items) }}
                of {{ metadata.total_items }} users
              </div>
              <div class="flex items-center gap-2">
                <label class="text-sm text-slate-500 dark:text-slate-400">Per page:</label>
                <select
                  v-model.number="pageSize"
                  @change="handlePageSizeChange(pageSize)"
                  class="h-8 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                </select>
              </div>
            </div>
            <div class="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                :disabled="metadata.page === 1"
                @click="handlePageChange(metadata.page - 1)"
              >
                Previous
              </Button>
              <div class="flex items-center gap-1">
                <Button
                  v-for="page in Math.min(metadata.total_pages, 5)"
                  :key="page"
                  variant="outline"
                  size="sm"
                  :class="{ 'bg-primary text-primary-foreground': page === metadata.page }"
                  @click="handlePageChange(page)"
                >
                  {{ page }}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                :disabled="metadata.page === metadata.total_pages"
                @click="handlePageChange(metadata.page + 1)"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
            <Button type="submit" class="flex-1" :disabled="!newPassword"> Change Password </Button>
            <Button type="button" variant="outline" @click="isPasswordDialogOpen = false">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogTitle>Delete User</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this user? This action cannot be undone.
        </DialogDescription>
        <div class="flex justify-end gap-2 mt-4">
          <Button variant="outline" @click="cancelDelete"> Cancel </Button>
          <Button variant="destructive" @click="confirmDelete"> Delete </Button>
        </div>
      </DialogContent>
    </Dialog>
  </MainLayout>
</template>
