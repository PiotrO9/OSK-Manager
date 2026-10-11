<script setup lang="ts">
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui';

type ManagerCourseDetailsTab =
    | 'overview'
    | 'participants'
    | 'instructor'
    | 'parameters';

const {
    NO_INSTRUCTOR_VALUE,
    route,
    course,
    loadError,
    instructors,
    instructorsLoadError,
    isInstructorsLoading,
    selectedInstructorProfileId,
    currentInstructorProfileId,
    qualifiedInstructors,
    effectiveSchoolId,
    backToCoursesHref,
    createCourseTarget,
    courseTitle,
    courseCategoryLabel,
    courseSubtitle,
    overviewItems,
    participants,
    participantsCurrentPage,
    participantsPagination,
    participantsTotal,
    participantsLoadError,
    isParticipantsLoading,
    capacityInsight,
    isDetailLoading,
    isPatchLoading,
    instructorSaveBlockedReason,
    canSaveInstructorAssignment,
    loadCourse,
    loadInstructors,
    loadParticipants,
    loadPreviousParticipantsPage,
    loadNextParticipantsPage,
    handleInstructorSelectChange,
    handleSaveInstructorAssignment,
    formatInstructorName,
} = useManagerCourseDetailPage();

const tabs: Array<{ value: ManagerCourseDetailsTab; label: string }> = [
    { value: 'overview', label: 'Przegląd' },
    { value: 'participants', label: 'Kursanci' },
    { value: 'instructor', label: 'Instruktor' },
    { value: 'parameters', label: 'Parametry' },
];

const activeTab = shallowRef<ManagerCourseDetailsTab>('overview');
const visitedTabs = reactive<Record<ManagerCourseDetailsTab, boolean>>({
    overview: true,
    participants: false,
    instructor: false,
    parameters: false,
});

watch(
    () => activeTab.value,
    (tab) => {
        visitedTabs[tab] = true;
    },
    { immediate: true },
);

watch(
    () => course.value?.id,
    () => {
        activeTab.value = 'overview';

        for (const tab of tabs) {
            visitedTabs[tab.value] = tab.value === 'overview';
        }
    },
);

function normalizeTab(value: string): ManagerCourseDetailsTab {
    return tabs.some((tab) => tab.value === value)
        ? (value as ManagerCourseDetailsTab)
        : 'overview';
}

function getTabTriggerId(tab: ManagerCourseDetailsTab): string {
    return `course-details-tab-${tab}`;
}

function getTabPanelId(tab: ManagerCourseDetailsTab): string {
    return `course-details-panel-${tab}`;
}

function isTabVisible(tab: ManagerCourseDetailsTab): boolean {
    return activeTab.value === tab;
}

function handleTabChange(value: string | number): void {
    activeTab.value = normalizeTab(String(value));
}
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
            <div
                class="grid min-w-0 gap-5 xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]"
            >
                <aside
                    class="min-w-0 space-y-5 xl:sticky xl:top-6 xl:self-start"
                >
                    <ManagerCourseProfileCard
                        :course="course"
                        :course-subtitle="courseSubtitle"
                        :course-category-label="courseCategoryLabel"
                        :instructor-name="formatInstructorName(course)"
                        :instructor-profile-id="currentInstructorProfileId"
                    />
                </aside>

                <main class="min-w-0">
                    <TabsRoot
                        :model-value="activeTab"
                        class="min-w-0 space-y-5"
                        @update:model-value="handleTabChange"
                    >
                        <div
                            class="border-border overflow-x-auto overflow-y-hidden border-b"
                            aria-label="Sekcje kartoteki kursu"
                        >
                            <TabsList class="flex min-w-max gap-5">
                                <TabsTrigger
                                    v-for="tab in tabs"
                                    :id="getTabTriggerId(tab.value)"
                                    :key="tab.value"
                                    :value="tab.value"
                                    :aria-controls="getTabPanelId(tab.value)"
                                    class="text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground focus-visible:ring-ring -mb-px cursor-pointer border-b-2 border-transparent px-1 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                >
                                    {{ tab.label }}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <section
                            v-if="visitedTabs.overview"
                            :id="getTabPanelId('overview')"
                            role="tabpanel"
                            :aria-labelledby="getTabTriggerId('overview')"
                            :hidden="!isTabVisible('overview')"
                        >
                            <ManagerCourseCapacityPanel
                                :insight="capacityInsight"
                                :is-loading="isParticipantsLoading"
                                :error="participantsLoadError"
                                @retry="loadParticipants"
                            />
                        </section>

                        <section
                            v-if="visitedTabs.participants"
                            :id="getTabPanelId('participants')"
                            role="tabpanel"
                            :aria-labelledby="getTabTriggerId('participants')"
                            :hidden="!isTabVisible('participants')"
                        >
                            <ManagerCourseProgressPanel
                                :participants="participants"
                                :current-page="participantsCurrentPage"
                                :pagination="participantsPagination"
                                :participants-total="participantsTotal"
                                :is-loading="isParticipantsLoading"
                                :error="participantsLoadError"
                                @retry="loadParticipants"
                                @prev-page="loadPreviousParticipantsPage"
                                @next-page="loadNextParticipantsPage"
                            />
                        </section>

                        <section
                            v-if="visitedTabs.instructor"
                            :id="getTabPanelId('instructor')"
                            role="tabpanel"
                            :aria-labelledby="getTabTriggerId('instructor')"
                            :hidden="!isTabVisible('instructor')"
                        >
                            <ManagerCourseInstructorAssignmentCard
                                v-model:selected-instructor-profile-id="
                                    selectedInstructorProfileId
                                "
                                :course="course"
                                :no-instructor-value="NO_INSTRUCTOR_VALUE"
                                :instructor-name="formatInstructorName(course)"
                                :instructor-profile-id="
                                    currentInstructorProfileId
                                "
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
                                @retry-instructors="
                                    loadInstructors(effectiveSchoolId)
                                "
                                @instructor-select-change="
                                    handleInstructorSelectChange
                                "
                                @save-instructor-assignment="
                                    handleSaveInstructorAssignment
                                "
                            />
                        </section>

                        <section
                            v-if="visitedTabs.parameters"
                            :id="getTabPanelId('parameters')"
                            role="tabpanel"
                            :aria-labelledby="getTabTriggerId('parameters')"
                            :hidden="!isTabVisible('parameters')"
                        >
                            <ManagerCourseOverviewCard :items="overviewItems" />
                        </section>
                    </TabsRoot>
                </main>
            </div>
        </template>
    </div>
</template>
