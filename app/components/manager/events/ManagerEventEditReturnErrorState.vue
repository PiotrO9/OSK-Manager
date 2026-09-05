<script setup lang="ts">
defineProps<{
    title: string;
    description: string;
}>();
</script>

<template>
    <ErrorState :title="title" :description="description">
        <template #action>
            <UiButton as-child variant="outline" class="bg-background">
                <NuxtLink to="/manager/instructors">
                    Wróć do listy instruktorów
                </NuxtLink>
            </UiButton>
        </template>
    </ErrorState>
</template>
