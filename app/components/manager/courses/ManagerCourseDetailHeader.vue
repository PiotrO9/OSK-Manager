<script setup lang="ts">
import { ArrowLeft, Plus } from 'lucide-vue-next';

defineProps<{
    title: string;
    description: string;
    backToCoursesHref: string | Record<string, unknown>;
    createCourseTarget: Record<string, unknown>;
}>();
</script>

<template>
    <PageHeader :title="title" :description="description">
        <template #actions>
            <UiButton
                as-child
                variant="outline"
                class="bg-background h-10 rounded-xl px-4 font-semibold shadow-sm"
            >
                <NuxtLink
                    :to="backToCoursesHref"
                    aria-label="Wróć do listy kursów"
                >
                    <ArrowLeft class="mr-2 size-4" aria-hidden="true" />
                    Lista kursów
                </NuxtLink>
            </UiButton>
            <UiButton
                as-child
                class="h-10 rounded-xl px-4 font-semibold shadow-sm"
            >
                <NuxtLink :to="createCourseTarget" aria-label="Dodaj nowy kurs">
                    <Plus class="mr-2 size-4" aria-hidden="true" />
                    Dodaj kurs
                </NuxtLink>
            </UiButton>
        </template>
    </PageHeader>
</template>
