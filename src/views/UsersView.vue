<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  usersService,
  type User,
  type CreateUserDto,
  type UpdateUserDto,
} from '@/services/users.service'
import MainLayout from '@/components/layouts/MainLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
import { formatDateTime } from '@/utils'
import { Pencil, Trash2, Plus } from 'lucide-vue-next'

const users = ref<User[]>([])
const isLoading = ref(false)
const isDialogOpen = ref(false)
const isEditing = ref(false)
const currentUser = ref<User | null>(null)

const formData = ref<CreateUserDto>({
  name: '',
  email: '',
  password: '',
  role: '',
})

const loadUsers = async () => {
  isLoading.value = true
  try {
    users.value = await usersService.getAll()
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    isLoading.value = false
  }
}

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

const openEditDialog = (user: User) => {
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
      await usersService.update(currentUser.value.id, updateData)
    } else {
      await usersService.create(formData.value)
    }
    isDialogOpen.value = false
    await loadUsers()
  } catch (error) {
    console.error('Failed to save user:', error)
  }
}

const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await usersService.delete(id)
      await loadUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }
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
            <DialogContent>
              <DialogTitle>{{ isEditing ? 'Edit User' : 'Create User' }}</DialogTitle>
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="space-y-2">
                  <Label for="name">Name</Label>
                  <Input id="name" v-model="formData.name" required />
                </div>

                <div class="space-y-2">
                  <Label for="email">Email</Label>
                  <Input id="email" v-model="formData.email" type="email" required />
                </div>

                <div class="space-y-2">
                  <Label for="password"
                    >Password {{ isEditing ? '(leave blank to keep current)' : '' }}</Label
                  >
                  <Input
                    id="password"
                    v-model="formData.password"
                    type="password"
                    :required="!isEditing"
                  />
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

                <div class="flex justify-end gap-2">
                  <Button type="button" variant="outline" @click="isDialogOpen = false">
                    Cancel
                  </Button>
                  <Button type="submit">
                    {{ isEditing ? 'Update' : 'Create' }}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div v-if="isLoading" class="text-center py-8">Loading...</div>
          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="user in users" :key="user?.id || Math.random()">
                <TableCell>{{ user?.id }}</TableCell>
                <TableCell>{{ user?.name }}</TableCell>
                <TableCell>{{ user?.email }}</TableCell>
                <TableCell>
                  <Badge
                    v-if="user?.role"
                    :variant="user.role === 'admin' ? 'default' : 'secondary'"
                  >
                    {{ user.role }}
                  </Badge>
                  <span v-else class="text-muted-foreground">-</span>
                </TableCell>
                <TableCell>{{
                  user?.created_at ? formatDateTime(user.created_at) : '-'
                }}</TableCell>
                <TableCell class="text-right">
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
        </CardContent>
      </Card>
    </div>
  </MainLayout>
</template>
