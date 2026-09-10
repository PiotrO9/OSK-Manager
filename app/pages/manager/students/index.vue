<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Kursanci',
    description: () => 'Lista i rejestracja kursantów w szkołach jazdy.',
});

const {
    schools,
    schoolsLoadError,
    isSchoolsLoading,
    activeSchoolId,
    courses,
    isCoursesLoading,
    coursesLoadError,
    activeCourseId,
    search,
    quickView,
    currentPage,
    students,
    studentsPagination,
    isStudentsLoading,
    studentsLoadError,
    formDialogOpen,
    assignDialogOpen,
    assignTargetDisplayName,
    isAssignSaving,
    assignApiError,
    isFormSaving,
    apiError,
    prefillSchoolId,
    activeSchool,
    totalStudentsCount,
    activeStudentsOnPage,
    studentsWithPkkOnPage,
    loadSchools,
    loadStudents,
    handleActiveSchoolChange,
    handleCourseFilterChange,
    handlePrevPage,
    handleNextPage,
    handleOpenCreateDialog,
    handleFormDialogOpenChange,
    handleOpenAssignCourse,
    handleAssignDialogOpenChange,
    handleAssignCourseSubmit,
    handleStudentSubmit,
} = useManagerStudentsPage();
</script>

<template>
    <div class="space-y-6">
        <ManagerStudentsPageHeader @create="handleOpenCreateDialog" />

        <section
            class="border-border bg-card min-w-0 overflow-hidden rounded-lg border shadow-xs"
            aria-label="Baza kursantów"
        >
            <ManagerStudentsFilters
                v-model:active-school-id="activeSchoolId"
                v-model:active-course-id="activeCourseId"
                :schools="schools"
                :courses="courses"
                :active-school-name="activeSchool?.name ?? null"
                :is-students-loading="isSchoolsLoading || isStudentsLoading"
                :is-courses-loading="isCoursesLoading"
                @school-change="handleActiveSchoolChange"
                @course-change="handleCourseFilterChange"
            />
            <ManagerStudentsSearch
                v-model:search="search"
                v-model:quick-view="quickView"
                :disabled="isSchoolsLoading || !activeSchoolId"
            />
            <ManagerStudentsStats
                :total-students-count="totalStudentsCount"
                :page-students-count="students.length"
                :active-students-on-page="activeStudentsOnPage"
                :students-with-pkk-on-page="studentsWithPkkOnPage"
                :is-unavailable="
                    isSchoolsLoading ||
                    isStudentsLoading ||
                    Boolean(schoolsLoadError || studentsLoadError)
                "
            />

            <p
                v-if="isCoursesLoading"
                class="text-muted-foreground px-5 py-3 text-sm"
                role="status"
            >
                Wczytywanie kursów do filtra…
            </p>
            <p
                v-else-if="coursesLoadError"
                class="text-destructive px-5 py-3 text-sm"
                role="alert"
                aria-live="polite"
            >
                {{ coursesLoadError }}
            </p>

            <div :aria-busy="isSchoolsLoading || isStudentsLoading">
                <LoadingState
                    v-if="isSchoolsLoading"
                    class="m-4 border-0 shadow-none"
                    title="Wczytywanie szkół jazdy"
                />
                <ErrorState
                    v-else-if="schoolsLoadError"
                    class="m-4"
                    title="Nie udało się wczytać szkół jazdy"
                    :description="schoolsLoadError"
                    @retry="loadSchools"
                />
                <EmptyState
                    v-else-if="schools.length === 0"
                    class="m-4"
                    title="Brak szkół jazdy"
                    description="Dodaj OSK w panelu szkół, aby wyświetlić listę kursantów."
                />
                <ErrorState
                    v-else-if="studentsLoadError"
                    class="m-4"
                    title="Nie udało się wczytać kursantów"
                    :description="studentsLoadError"
                    @retry="loadStudents"
                />
                <LoadingState
                    v-else-if="isStudentsLoading"
                    class="m-4 border-0 shadow-none"
                    title="Wczytywanie kursantów"
                    :show-labels="false"
                />
                <EmptyState
                    v-else-if="students.length === 0"
                    class="m-4"
                    :title="
                        search.trim() || quickView !== 'all'
                            ? 'Brak wyników wyszukiwania'
                            : activeCourseId
                              ? 'Brak kursantów w tym kursie'
                              : 'Brak kursantów'
                    "
                    :description="
                        search.trim() || quickView !== 'all'
                            ? 'Zmień wyszukiwanie lub wyczyść filtry, aby zobaczyć pozostałych kursantów.'
                            : activeCourseId
                              ? 'Wybierz inny kurs lub wyczyść filtr, aby zobaczyć pozostałych kursantów.'
                              : 'Dodaj pierwszego kursanta do wybranej szkoły jazdy.'
                    "
                >
                    <template #action>
                        <UiButton
                            v-if="
                                activeCourseId ||
                                search.trim() ||
                                quickView !== 'all'
                            "
                            variant="outline"
                            @click="
                                search = '';
                                quickView = 'all';
                                activeCourseId = '';
                                handleCourseFilterChange();
                            "
                            >Wyczyść filtry</UiButton
                        >
                        <UiButton v-else @click="handleOpenCreateDialog"
                            >Dodaj kursanta</UiButton
                        >
                    </template>
                </EmptyState>
                <ManagerStudentsList
                    v-else
                    class="rounded-none border-0 shadow-none"
                    :students="students"
                    :active-school-id="activeSchoolId"
                    :is-students-loading="isStudentsLoading"
                    @assign-course="handleOpenAssignCourse"
                />
            </div>
            <ManagerStudentsPagination
                :active-school-id="activeSchoolId"
                :current-page="currentPage"
                :pagination="studentsPagination"
                :is-students-loading="isStudentsLoading"
                :has-error="Boolean(studentsLoadError)"
                @prev="handlePrevPage"
                @next="handleNextPage"
            />
        </section>

        <ManagerStudentAssignCourseDialog
            :open="assignDialogOpen"
            :student-display-name="assignTargetDisplayName"
            :courses="courses"
            :is-courses-loading="isCoursesLoading"
            :courses-load-error="coursesLoadError"
            :is-saving="isAssignSaving"
            :api-error="assignApiError"
            @update:open="handleAssignDialogOpenChange"
            @submit="handleAssignCourseSubmit"
        />

        <ManagerStudentFormDialog
            :open="formDialogOpen"
            :schools="schools"
            :is-schools-loading="isSchoolsLoading"
            :schools-load-error="schoolsLoadError"
            :is-saving="isFormSaving"
            :api-error="apiError"
            :prefill-school-id="prefillSchoolId"
            @update:open="handleFormDialogOpenChange"
            @submit="handleStudentSubmit"
        />
    </div>
</template>
