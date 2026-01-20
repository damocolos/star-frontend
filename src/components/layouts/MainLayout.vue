<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Home, Users, ListTodo, LogOut } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="container mx-auto flex h-16 items-center justify-between px-4">
        <div class="flex items-center gap-6">
          <h1 class="text-xl font-bold">Task Manager</h1>
          <nav class="flex gap-4">
            <Button
              variant="ghost"
              @click="router.push('/')"
              :class="{ 'bg-accent': router.currentRoute.value.path === '/' }"
            >
              <Home class="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              variant="ghost"
              @click="router.push('/users')"
              :class="{ 'bg-accent': router.currentRoute.value.path === '/users' }"
            >
              <Users class="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button
              variant="ghost"
              @click="router.push('/tasks')"
              :class="{ 'bg-accent': router.currentRoute.value.path === '/tasks' }"
            >
              <ListTodo class="mr-2 h-4 w-4" />
              Tasks
            </Button>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-muted-foreground">
            {{ authStore.user?.name || authStore.user?.email }}
          </span>
          <Button variant="outline" @click="handleLogout">
            <LogOut class="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>
