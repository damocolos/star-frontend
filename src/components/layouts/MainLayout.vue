<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Users, LogOut, ChevronDown, ListTodo } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isDropdownOpen = ref(false)

const isAdmin = computed(() => authStore.user?.role === 'admin')

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
  isDropdownOpen.value = false
}

const navigateToUsers = () => {
  router.push('/users')
  isDropdownOpen.value = false
}

const navigateToTasks = () => {
  router.push('/')
  isDropdownOpen.value = false
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
  >
    <!-- Top Navigation Bar -->
    <nav
      class="sticky top-0 z-40 bg-white dark:bg-slate-900 shadow-md border-b border-slate-200 dark:border-slate-700"
    >
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Left: Title and Navigation -->
          <div class="flex items-center gap-6">
            <h1
              class="text-xl font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
              @click="navigateToTasks"
            >
              Task Manager
            </h1>
            <div class="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                :class="{
                  'bg-slate-100 dark:bg-slate-800': route.path === '/',
                }"
                @click="navigateToTasks"
              >
                <ListTodo class="mr-2 h-4 w-4" />
                Tasks
              </Button>
              <Button
                v-if="isAdmin"
                variant="ghost"
                :class="{
                  'bg-slate-100 dark:bg-slate-800': route.path === '/users',
                }"
                @click="navigateToUsers"
              >
                <Users class="mr-2 h-4 w-4" />
                Users
              </Button>
            </div>
          </div>

          <!-- Right: User Account Dropdown -->
          <div class="flex items-center gap-4">
            <Popover v-model:open="isDropdownOpen">
              <PopoverTrigger as-child>
                <Button variant="ghost" class="flex items-center gap-2">
                  <div class="flex flex-col items-end">
                    <span class="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {{ authStore.user?.name || authStore.user?.email }}
                    </span>
                    <span class="text-xs text-slate-500 dark:text-slate-400">
                      {{ authStore.user?.role || 'User' }}
                    </span>
                  </div>
                  <ChevronDown class="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-56 p-2" align="end">
                <div class="space-y-1">
                  <!-- Mobile Navigation Links -->
                  <Button
                    variant="ghost"
                    class="w-full justify-start md:hidden"
                    @click="navigateToTasks"
                  >
                    <ListTodo class="mr-3 h-4 w-4" />
                    Tasks
                  </Button>

                  <!-- Logout -->
                  <Button
                    variant="ghost"
                    class="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    @click="handleLogout"
                  >
                    <LogOut class="mr-3 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>
