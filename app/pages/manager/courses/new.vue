<script setup lang="ts">
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { CourseCreatePayload } from '~/types/courses/course';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { useAppToast } from '~/composables/core/useAppToast';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Nowy kurs',
    description: () => 'Utwórz kurs przypisany do szkoły jazdy.',
});

const route = useRoute();
const schoolIdFromOldUrl =
    typeof route.query.schoolId === 'string' ? route.query.schoolId : '';
const { addToast } = useAppToast();
const { fetchList: fetchInstructorsList } = useInstructorsApi();
const { fetchList: fetchDrivingSchoolsList } = useDrivingSchoolsApi();
const { createCourse, isCreateLoading } = useCoursesApi();

const schoolId = useManagerCoursesSelectedSchoolId();

const instructors = ref<InstructorListItem[]>([]);
const instructorsLoadError = ref<string | null>(null);
const isInstructorsLoading = ref(false);

const drivingSchools = ref<DrivingSchool[]>([]);
const schoolContextError = ref<string | null>(null);
const isSchoolContextLoading = ref(true);

const apiError = ref<string | null>(null);
const isCreated = ref(false);
let schoolRequestId = 0;
let instructorRequestId = 0;

const currentSchool = computed(() => {
    const selectedSchoolId = schoolId.value;

    return drivingSchools.value.find(
        (school) => school.id === selectedSchoolId,
    );
});

const offeredCourseTypes = computed(
    () => currentSchool.value?.offeredCourseTypes ?? [],
);

const enabledCourseKinds = computed(
    () => currentSchool.value?.enabledCourseKinds,
);

async function loadInstructors(selectedSchoolId: string) {
    const requestId = ++instructorRequestId;

    instructorsLoadError.value = null;
    isInstructorsLoading.value = true;
    instructors.value = [];

    try {
        const result = await fetchInstructorsList(selectedSchoolId);

        if (requestId === instructorRequestId) instructors.value = result;
    } catch (e) {
        if (requestId !== instructorRequestId) return;

        instructors.value = [];
        instructorsLoadError.value = getApiFetchErrorMessage(
            e,
            'Nie udało się pobrać listy instruktorów.',
        );
    } finally {
        if (requestId === instructorRequestId)
            isInstructorsLoading.value = false;
    }
}

async function loadSchoolContext() {
    const requestId = ++schoolRequestId;

    schoolContextError.value = null;
    isSchoolContextLoading.value = true;
    drivingSchools.value = [];

    try {
        const result = await fetchDrivingSchoolsList();

        if (requestId !== schoolRequestId) return;

        drivingSchools.value = result;

        if (result.some((school) => school.id === schoolIdFromOldUrl)) {
            schoolId.value = schoolIdFromOldUrl;
        } else if (!result.some((school) => school.id === schoolId.value)) {
            schoolId.value =
                result.find((school) => school.isDefault)?.id ??
                result[0]?.id ??
                '';
        }

        if (schoolId.value) void loadInstructors(schoolId.value);
    } catch (e) {
        if (requestId !== schoolRequestId) return;

        drivingSchools.value = [];
        schoolContextError.value = getApiFetchErrorMessage(
            e,
            'Nie udało się pobrać listy szkół jazdy.',
        );
    } finally {
        if (requestId === schoolRequestId) isSchoolContextLoading.value = false;
    }
}

function handleSchoolChange(selectedSchoolId: string) {
    if (!drivingSchools.value.some((school) => school.id === selectedSchoolId))
        return;

    schoolId.value = selectedSchoolId;
    apiError.value = null;
    void loadInstructors(selectedSchoolId);
}

onMounted(() => {
    if ('schoolId' in route.query) {
        const query = { ...route.query };

        delete query.schoolId;
        void navigateTo({ path: route.path, query }, { replace: true });
    }

    void loadSchoolContext();
});
onBeforeUnmount(() => {
    schoolRequestId++;
    instructorRequestId++;
});

async function handleCourseSubmit(payload: CourseCreatePayload) {
    if (isCreateLoading.value) return;

    apiError.value = null;

    try {
        await createCourse(payload);
        isCreated.value = true;

        addToast({
            title: 'Kurs został utworzony',
            variant: 'success',
        });

        await navigateTo('/manager/courses', { replace: true });
    } catch (err) {
        const message = getApiFetchErrorMessage(
            err,
            'Nie udało się utworzyć kursu.',
        );

        apiError.value = message;

        addToast({
            title: 'Błąd',
            description: message,
            variant: 'error',
        });
    }
}
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Dodaj kurs"
            description="Uzupełnij nazwę, kategorię, liczbę godzin i ustawienia kursu."
        >
            <template #actions>
                <UiButton
                    type="submit"
                    form="course-create-form"
                    :disabled="
                        isCreateLoading ||
                        isSchoolContextLoading ||
                        !currentSchool ||
                        schoolContextError !== null ||
                        (enabledCourseKinds?.length ?? 0) === 0
                    "
                    :aria-busy="isCreateLoading"
                >
                    {{ isCreateLoading ? 'Tworzenie…' : 'Zapisz' }}
                </UiButton>
            </template>
        </PageHeader>

        <div
            v-if="isSchoolContextLoading"
            class="border-border bg-background rounded-2xl border p-6"
            role="status"
        >
            <p class="text-muted-foreground text-sm">
                Wczytywanie ustawień szkoły…
            </p>
        </div>

        <div
            v-else-if="schoolContextError"
            class="border-border bg-background rounded-2xl border p-6"
            role="alert"
        >
            <h2 class="text-foreground font-semibold">
                Nie można wczytać szkoły
            </h2>
            <p class="text-muted-foreground mt-2 text-sm">
                {{ schoolContextError }}
            </p>
            <UiButton
                type="button"
                variant="outline"
                class="mt-4"
                @click="loadSchoolContext"
            >
                Spróbuj ponownie
            </UiButton>
        </div>

        <div
            v-else-if="!currentSchool"
            class="border-border bg-background rounded-2xl border p-6"
        >
            <h2 class="text-foreground font-semibold">Brak szkoły jazdy</h2>
            <p class="text-muted-foreground mt-2 text-sm">
                Dodaj OSK, aby móc utworzyć kurs.
            </p>
        </div>

        <template v-else>
            <div class="border-border bg-card rounded-xl border px-4 py-3">
                <SchoolContextSelect
                    v-if="drivingSchools.length > 1"
                    id="course-create-school"
                    :schools="drivingSchools"
                    :model-value="schoolId"
                    @update:model-value="handleSchoolChange"
                />
                <SchoolContext v-else :school="currentSchool" />
            </div>
            <CourseCreateForm
                id="course-create-form"
                :key="schoolId"
                :school-id="schoolId"
                :offered-course-types="offeredCourseTypes"
                :enabled-course-kinds="enabledCourseKinds"
                :is-school-context-loading="isSchoolContextLoading"
                :instructors="instructors"
                :is-instructors-loading="isInstructorsLoading"
                :instructors-load-error="instructorsLoadError"
                :is-saving="isCreateLoading"
                :is-created="isCreated"
                :api-error="apiError"
                @submit="handleCourseSubmit"
                @retry-instructors="loadInstructors(schoolId)"
            />
        </template>

        <NuxtLink
            to="/manager/courses"
            class="text-primary inline-flex text-sm font-medium underline-offset-4 hover:underline"
        >
            Wróć do listy kursów
        </NuxtLink>
    </div>
</template>
