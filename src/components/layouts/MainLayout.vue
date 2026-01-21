<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Menu, X, Users, LogOut, Home } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
  isSidebarOpen.value = false
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const navigateToUsers = () => {
  router.push('/users')
  isSidebarOpen.value = false
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
  >
    <!-- Floating Menu and Home Buttons -->
    <div class="fixed top-4 left-4 z-40 flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        @click="toggleSidebar"
        class="h-12 w-12 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
      >
        <Menu class="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        @click="router.push('/')"
        class="h-12 w-12 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
      >
        <Home class="h-5 w-5" />
      </Button>
    </div>

    <!-- Sidebar Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        @click="toggleSidebar"
      ></div>
    </Transition>

    <!-- Sidebar -->
    <Transition
      enter-active-class="transition-transform duration-300"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="isSidebarOpen"
        class="fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-700"
      >
        <div
          class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700"
        >
          <h2 class="text-lg font-semibold">Task Manager</h2>
          <Button variant="ghost" size="icon" @click="toggleSidebar">
            <X class="h-5 w-5" />
          </Button>
        </div>

        <nav class="p-4 space-y-2">
          <!-- User Info -->
          <div class="mb-6 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
              {{ authStore.user?.name || authStore.user?.email }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{ authStore.user?.role || 'User' }}
            </p>
          </div>

          <!-- Users Menu (Admin Only) -->
          <Button
            v-if="authStore.user?.role === 'admin'"
            variant="ghost"
            class="w-full justify-start hover:bg-slate-100 dark:hover:bg-slate-800"
            @click="navigateToUsers"
          >
            <Users class="mr-3 h-5 w-5" />
            Users Management
          </Button>

          <!-- Logout -->
          <Button
            variant="ghost"
            class="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            @click="handleLogout"
          >
            <LogOut class="mr-3 h-5 w-5" />
            Logout
          </Button>
        </nav>
      </aside>
    </Transition>

    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>
