<script setup lang="ts">
import { appPaths } from '~~/shared/routing/appPaths';
defineProps<{
    title: string;
    description: string;
}>();
</script>

<template>
    <ErrorState :title="title" :description="description">
        <template #action>
            <UiButton as-child variant="outline" class="bg-background">
                <NuxtLink :to="appPaths.managerInstructors()">
                    Wróć do listy instruktorów
                </NuxtLink>
            </UiButton>
        </template>
    </ErrorState>
</template>
