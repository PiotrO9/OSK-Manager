<script setup lang="ts">
import { UserPlus } from 'lucide-vue-next';
import {
    designSystemStudents,
    designSystemSchool,
    designSystemCourses,
} from '~/data/design-system/fixtures';
import { getDefaultStudentAdvancedFilterDraft } from '~~/shared/utils/studentAdvancedFilters';
import type { StudentListView } from '~~/shared/utils/studentListFilters';
const scenario = shallowRef('data');
const search = shallowRef('');
const quickView = shallowRef<StudentListView>('all');
const activeSchoolId = shallowRef('design-system');
const activeCourseId = shallowRef('');
const isLoading = computed(() => scenario.value === 'loading');
const students = computed(() =>
    ['empty', 'no-results'].includes(scenario.value)
        ? []
        : designSystemStudents,
);
const page = shallowRef(1);
const pageStudents = computed(() =>
    students.value.slice((page.value - 1) * 2, page.value * 2),
);
const pagination = computed(() => ({
    total: students.value.length,
    totalPages: Math.ceil(students.value.length / 2),
}));

watch(scenario, () => {
    page.value = 1;
});
</script>
<template>
    <div class="space-y-5">
        <DesignSystemScenarioControls
            v-model="scenario"
            label="Scenariusz listy CRM"
        />
        <PageHeader
            title="Kursanci"
            description="Lista kursantów przypisanych do wybranej szkoły."
            eyebrow="Manager"
        >
            <template #actions
                ><UiButton
                    ><UserPlus aria-hidden="true" /> Dodaj kursanta</UiButton
                ></template
            >
        </PageHeader>
        <section
            class="border-border bg-card min-w-0 rounded-xl border shadow-xs"
            aria-label="Lista kursantów CRM"
        >
            <ManagerStudentsFilters
                v-model:active-school-id="activeSchoolId"
                v-model:active-course-id="activeCourseId"
                :schools="[designSystemSchool]"
                :courses="designSystemCourses"
                :active-school="designSystemSchool"
                :is-students-loading="isLoading"
                :is-courses-loading="false"
            />
            <ManagerStudentsSearch
                v-model:search="search"
                v-model:quick-view="quickView"
                :advanced-filters="[]"
                :advanced-filter-draft="getDefaultStudentAdvancedFilterDraft()"
                :advanced-filter-draft-error="null"
                :courses="designSystemCourses"
                :disabled="isLoading"
            />
            <ManagerStudentsStats
                :total-students-count="students.length"
                :page-students-count="pageStudents.length"
                :active-students-on-page="
                    pageStudents.filter((student) => student.isActive).length
                "
                :students-with-pkk-on-page="
                    pageStudents.filter((student) => student.pkkNumber).length
                "
                :is-unavailable="isLoading || scenario === 'error'"
            />
            <LoadingState
                v-if="isLoading"
                class="m-4 border-0 shadow-none"
                title="Wczytywanie kursantów"
            />
            <ErrorState
                v-else-if="scenario === 'error'"
                class="m-4"
                title="Nie udało się wczytać kursantów"
                @retry="scenario = 'data'"
            />
            <EmptyState
                v-else-if="students.length === 0"
                class="m-4"
                :title="
                    scenario === 'no-results'
                        ? 'Brak wyników wyszukiwania'
                        : 'Brak kursantów'
                "
                :description="
                    scenario === 'no-results'
                        ? 'Zmień wyszukiwanie lub wyczyść filtry.'
                        : 'Dodaj pierwszego kursanta do wybranej szkoły.'
                "
            >
                <template #action
                    ><UiButton variant="outline">{{
                        scenario === 'no-results'
                            ? 'Wyczyść filtry'
                            : 'Dodaj kursanta'
                    }}</UiButton></template
                >
            </EmptyState>
            <ManagerStudentsList
                v-else
                class="rounded-none border-0 shadow-none"
                :students="pageStudents"
                active-school-id="design-system"
                :is-students-loading="false"
                :show-details-link="false"
            />
            <ManagerStudentsPagination
                active-school-id="design-system"
                :current-page="page"
                :pagination="pagination"
                :is-students-loading="isLoading"
                :has-error="scenario === 'error'"
                @prev="page = Math.max(1, page - 1)"
                @next="page = Math.min(pagination.totalPages, page + 1)"
            />
        </section>
    </div>
</template>
