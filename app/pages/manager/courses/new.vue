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
const { addToast } = useAppToast();
const { fetchList: fetchInstructorsList } = useInstructorsApi();
const { fetchList: fetchDrivingSchoolsList } = useDrivingSchoolsApi();
const { createCourse, isCreateLoading } = useCoursesApi();

const schoolId = computed(() => {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') {
        return null;
    }

    const t = s.trim();

    return t.length > 0 ? t : null;
});

const instructors = ref<InstructorListItem[]>([]);
const instructorsLoadError = ref<string | null>(null);
const isInstructorsLoading = ref(false);

const drivingSchools = ref<DrivingSchool[]>([]);
const schoolContextError = ref<string | null>(null);
const isSchoolContextLoading = ref(false);

const apiError = ref<string | null>(null);
const isCreated = ref(false);
let schoolRequestId = 0;
let instructorRequestId = 0;

const currentSchool = computed(() => {
    const sid = schoolId.value;

    if (!sid) {
        return undefined;
    }

    return drivingSchools.value.find((s) => s.id === sid);
});

const offeredCourseTypes = computed(
    () => currentSchool.value?.offeredCourseTypes ?? [],
);

const enabledCourseKinds = computed(
    () => currentSchool.value?.enabledCourseKinds,
);

const schoolMissingFromContext = computed(
    () =>
        schoolId.value !== null &&
        !isSchoolContextLoading.value &&
        !schoolContextError.value &&
        currentSchool.value === undefined,
);

async function loadInstructors(sid: string) {
    const requestId = ++instructorRequestId;

    instructorsLoadError.value = null;
    isInstructorsLoading.value = true;
    instructors.value = [];

    try {
        const result = await fetchInstructorsList(sid);

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

        if (requestId === schoolRequestId) drivingSchools.value = result;
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

watch(
    schoolId,
    (sid) => {
        if (sid) {
            loadSchoolContext();
            loadInstructors(sid);
        } else {
            schoolRequestId++;
            instructorRequestId++;
            drivingSchools.value = [];
            instructors.value = [];
            isSchoolContextLoading.value = false;
            isInstructorsLoading.value = false;
        }
    },
    { immediate: true },
);

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

        await navigateTo(
            {
                path: '/manager/courses',
                query: { schoolId: payload.schoolId },
            },
            { replace: true },
        );
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
                        schoolId === null ||
                        schoolContextError !== null ||
                        schoolMissingFromContext ||
                        (enabledCourseKinds?.length ?? 0) === 0
                    "
                    :aria-busy="isCreateLoading"
                >
                    {{ isCreateLoading ? 'Tworzenie…' : 'Zapisz' }}
                </UiButton>
            </template>
        </PageHeader>

        <div
            v-if="schoolId === null"
            class="border-border bg-background rounded-2xl border p-6"
        >
            <h2 class="text-foreground font-semibold">Wybierz szkołę</h2>
            <p class="text-muted-foreground mt-2 text-sm">
                Otwórz dodawanie kursu z listy kursów wybranej szkoły.
            </p>
            <UiButton as-child variant="outline" class="mt-4">
                <NuxtLink to="/manager/courses">Przejdź do kursów</NuxtLink>
            </UiButton>
        </div>

        <template v-else>
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
                v-else-if="schoolMissingFromContext"
                class="border-border bg-background rounded-2xl border p-6"
                role="alert"
            >
                <h2 class="text-foreground font-semibold">
                    Szkoła niedostępna
                </h2>
                <p class="text-muted-foreground mt-2 text-sm">
                    Nie znaleziono tej szkoły na liście Twoich OSK albo nie masz
                    do niej dostępu.
                </p>
            </div>

            <CourseCreateForm
                v-else
                id="course-create-form"
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

            <NuxtLink
                :to="{
                    path: '/manager/courses',
                    query: { schoolId },
                }"
                class="text-primary inline-flex text-sm font-medium underline-offset-4 hover:underline"
            >
                Wróć do listy kursów
            </NuxtLink>
        </template>
    </div>
</template>
