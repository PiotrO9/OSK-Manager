<script setup lang="ts">
import MyCoursesFilters from '~/components/courses/MyCoursesFilters.vue';
import MyCoursesList from '~/components/courses/MyCoursesList.vue';
import { CalendarPlus } from 'lucide-vue-next';

definePageMeta({
    layout: 'app-shell',
    middleware: ['student'],
});

usePageMeta({
    title: () => 'Moje kursy',
    description: () => 'Kursy przypisane do Twojego konta.',
});

const page = useMyCoursesPage();
</script>

<template>
    <div class="mx-auto w-full max-w-[1120px] space-y-5 md:space-y-6">
        <PageHeader
            title="Moje kursy"
            description="Postęp szkolenia i przypisane kursy."
        >
            <template #actions>
                <UiButton
                    as-child
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        to="/book-lesson"
                        aria-label="Przejdź do rezerwacji jazdy"
                    >
                        <CalendarPlus class="mr-2 size-4" aria-hidden="true" />
                        Rezerwuj jazdę
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <MyCoursesFilters
            v-if="!page.errorMessage.value"
            v-model="page.activeFilter.value"
            :options="page.filterOptions.value"
            :result-label="page.resultLabel.value"
            :summary="page.summary.value"
            :is-loading="page.isLoading.value"
        />

        <MyCoursesList
            :courses="page.visibleCourses.value"
            :empty-state="page.emptyState.value"
            :is-loading="page.isLoading.value"
            :error-message="page.errorMessage.value"
            @retry="page.loadCourses"
            @show-all="page.handleShowAllCourses"
        />
    </div>
</template>
