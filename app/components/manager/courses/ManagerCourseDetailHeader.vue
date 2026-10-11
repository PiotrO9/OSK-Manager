<script setup lang="ts">
import { ArrowLeft, Plus, Pencil } from 'lucide-vue-next';
import type { RouteLocationRaw } from 'vue-router';

defineProps<{
    title: string;
    description: string;
    backToCoursesHref: RouteLocationRaw;
    createCourseTarget: RouteLocationRaw;
    editCourseTarget?: RouteLocationRaw;
}>();
</script>

<template>
    <PageHeader :title="title" :description="description">
        <template #actions>
            <UiButton
                v-if="editCourseTarget"
                as-child
                variant="outline"
                class="h-10 rounded-lg px-4 font-semibold shadow-xs"
            >
                <NuxtLink :to="editCourseTarget"
                    ><Pencil class="mr-2 size-4" aria-hidden="true" />Edytuj
                    kurs</NuxtLink
                >
            </UiButton>
            <UiButton
                as-child
                variant="outline"
                class="h-10 rounded-lg px-4 font-semibold shadow-xs"
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
                class="h-10 rounded-lg px-4 font-semibold shadow-xs"
            >
                <NuxtLink :to="createCourseTarget" aria-label="Dodaj nowy kurs">
                    <Plus class="mr-2 size-4" aria-hidden="true" />
                    Dodaj kurs
                </NuxtLink>
            </UiButton>
        </template>
    </PageHeader>
</template>
