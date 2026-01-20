<script setup lang="ts">
import MainLayout from '@/components/layouts/MainLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <MainLayout>
    <div class="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Task Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="mb-4">
            Hello, <strong>{{ authStore.user?.name || authStore.user?.email }}</strong
            >!
          </p>
          <p class="text-muted-foreground">Use the navigation above to manage users and tasks.</p>
          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">
                  Manage user accounts, roles, and permissions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">
                  Create, update, and track tasks with different priorities and statuses.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  </MainLayout>
</template>
