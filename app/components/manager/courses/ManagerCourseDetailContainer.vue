<script setup lang="ts">
const {
    NO_INSTRUCTOR_VALUE,
    route,
    course,
    loadError,
    instructors,
    instructorsLoadError,
    isInstructorsLoading,
    selectedInstructorProfileId,
    qualifiedInstructors,
    effectiveSchoolId,
    backToCoursesHref,
    createCourseTarget,
    courseTitle,
    courseCategoryLabel,
    courseSubtitle,
    courseInitials,
    overviewItems,
    relatedItems,
    isDetailLoading,
    isPatchLoading,
    instructorSaveBlockedReason,
    canSaveInstructorAssignment,
    loadCourse,
    loadInstructors,
    handleInstructorSelectChange,
    handleSaveInstructorAssignment,
    formatInstructorName,
} = useManagerCourseDetailPage();
</script>

<template>
    <div class="space-y-5">
        <ManagerCourseDetailHeader
            :title="courseTitle"
            :description="courseSubtitle"
            :back-to-courses-href="backToCoursesHref"
            :create-course-target="createCourseTarget"
        />

        <LoadingState
            v-if="isDetailLoading"
            title="Wczytywanie kursu"
            description="Pobieram parametry kursu i aktualne przypisanie instruktora."
        />

        <ErrorState
            v-else-if="loadError"
            title="Nie udało się wczytać kursu"
            :description="loadError"
            @retry="loadCourse(route.params.id)"
        />

        <template v-else-if="course">
            <div class="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
                <ManagerCourseProfileCard
                    :course="course"
                    :course-initials="courseInitials"
                    :course-subtitle="courseSubtitle"
                    :course-category-label="courseCategoryLabel"
                    :instructor-name="formatInstructorName(course)"
                />

                <ManagerCourseOverviewCard :items="overviewItems" />
            </div>

            <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                <ManagerCourseInstructorAssignmentCard
                    v-model:selected-instructor-profile-id="
                        selectedInstructorProfileId
                    "
                    :course="course"
                    :no-instructor-value="NO_INSTRUCTOR_VALUE"
                    :instructor-name="formatInstructorName(course)"
                    :instructor-save-blocked-reason="
                        instructorSaveBlockedReason
                    "
                    :instructors-load-error="instructorsLoadError"
                    :is-instructors-loading="isInstructorsLoading"
                    :is-patch-loading="isPatchLoading"
                    :effective-school-id="effectiveSchoolId"
                    :instructors="instructors"
                    :qualified-instructors="qualifiedInstructors"
                    :can-save-instructor-assignment="
                        canSaveInstructorAssignment
                    "
                    @retry-instructors="loadInstructors(effectiveSchoolId)"
                    @instructor-select-change="handleInstructorSelectChange"
                    @save-instructor-assignment="handleSaveInstructorAssignment"
                />

                <ManagerCourseRelatedDataCard :items="relatedItems" />
            </div>
        </template>
    </div>
</template>
