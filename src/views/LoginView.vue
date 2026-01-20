<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })
    router.push('/')
  } catch (err) {
    const errorMessage =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Login failed. Please check your credentials.'
    error.value = errorMessage
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-center text-3xl">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="your@email.com"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              :disabled="isLoading"
            />
          </div>

          <div v-if="error" class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {{ error }}
          </div>

          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
