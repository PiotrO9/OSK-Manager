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
    activeCourse,
    totalStudentsCount,
    activeStudentsOnPage,
    studentsWithPkkOnPage,
    visibleStudentsLabel,
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
    <div class="space-y-5">
        <ManagerStudentsPageHeader @create="handleOpenCreateDialog" />

        <ManagerStudentsStats
            :total-students-count="totalStudentsCount"
            :page-students-count="students.length"
            :active-students-on-page="activeStudentsOnPage"
            :students-with-pkk-on-page="studentsWithPkkOnPage"
        />

        <UiCard class="overflow-hidden rounded-2xl shadow-sm">
            <UiCardHeader class="border-border border-b p-5 pt-0">
                <div
                    class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"
                >
                    <div class="space-y-1">
                        <UiCardTitle class="text-xl font-extrabold">
                            Lista kursantów
                        </UiCardTitle>
                        <UiCardDescription>
                            {{ visibleStudentsLabel }}
                            <span v-if="activeSchool">
                                · {{ activeSchool.name }}
                            </span>
                        </UiCardDescription>
                    </div>
                    <UiBadge
                        v-if="activeCourse"
                        variant="outline"
                        class="w-fit rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
                    >
                        Kurs: {{ activeCourse.name }}
                    </UiBadge>
                </div>
            </UiCardHeader>

            <UiCardContent
                class="space-y-4 px-4 py-0"
                :aria-busy="isSchoolsLoading || isStudentsLoading"
            >
                <ManagerStudentsFilters
                    v-model:active-school-id="activeSchoolId"
                    v-model:active-course-id="activeCourseId"
                    :schools="schools"
                    :courses="courses"
                    :active-school-name="activeSchool?.name ?? null"
                    :is-students-loading="isStudentsLoading"
                    :is-courses-loading="isCoursesLoading"
                    @school-change="handleActiveSchoolChange"
                    @course-change="handleCourseFilterChange"
                />

                <p
                    v-if="isCoursesLoading"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Wczytywanie kursów do filtra…
                </p>
                <p
                    v-else-if="coursesLoadError"
                    class="text-destructive text-sm"
                    role="alert"
                    aria-live="polite"
                >
                    {{ coursesLoadError }}
                </p>

                <div v-if="isSchoolsLoading" class="space-y-3" role="status">
                    <UiSkeleton class="h-16 rounded-xl" />
                    <UiSkeleton class="h-16 rounded-xl" />
                    <UiSkeleton class="h-16 rounded-xl" />
                </div>

                <ErrorState
                    v-else-if="schoolsLoadError"
                    title="Nie udało się wczytać szkół jazdy"
                    :description="schoolsLoadError"
                    @retry="loadSchools"
                />

                <EmptyState
                    v-else-if="schools.length === 0"
                    title="Brak szkół jazdy"
                    description="Dodaj OSK w panelu szkół, aby wyświetlić listę kursantów."
                />

                <ErrorState
                    v-else-if="studentsLoadError"
                    title="Nie udało się wczytać kursantów"
                    :description="studentsLoadError"
                    @retry="loadStudents"
                />

                <div
                    v-else-if="isStudentsLoading"
                    class="space-y-3"
                    role="status"
                >
                    <UiSkeleton class="h-14 rounded-xl" />
                    <UiSkeleton class="h-14 rounded-xl" />
                    <UiSkeleton class="h-14 rounded-xl" />
                </div>

                <EmptyState
                    v-else-if="students.length === 0"
                    title="Brak kursantów"
                    description="W wybranej szkole lub filtrze kursu nie ma jeszcze kursantów."
                />

                <ManagerStudentsList
                    v-else
                    :students="students"
                    :active-school-id="activeSchoolId"
                    :is-students-loading="isStudentsLoading"
                    @assign-course="handleOpenAssignCourse"
                />

                <ManagerStudentsPagination
                    :active-school-id="activeSchoolId"
                    :current-page="currentPage"
                    :pagination="studentsPagination"
                    :is-students-loading="isStudentsLoading"
                    :has-error="Boolean(studentsLoadError)"
                    @prev="handlePrevPage"
                    @next="handleNextPage"
                />
            </UiCardContent>
        </UiCard>

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
