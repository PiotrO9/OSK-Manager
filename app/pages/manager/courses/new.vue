<script setup lang="ts">
import { CalendarDays, Plus } from 'lucide-vue-next';
import type { InstructorListItem } from '~/types/instructor';
import type { CourseCreatePayload } from '~/types/course';
import type { DrivingSchool } from '~/types/drivingSchool';
import { useAppToast } from '~/composables/useAppToast';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

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
    instructorsLoadError.value = null;
    isInstructorsLoading.value = true;

    try {
        instructors.value = await fetchInstructorsList(sid);
    } catch (e) {
        instructors.value = [];
        instructorsLoadError.value = getApiFetchErrorMessage(
            e,
            'Nie udało się pobrać listy instruktorów.',
        );
    } finally {
        isInstructorsLoading.value = false;
    }
}

async function loadSchoolContext() {
    schoolContextError.value = null;
    isSchoolContextLoading.value = true;

    try {
        drivingSchools.value = await fetchDrivingSchoolsList();
    } catch (e) {
        drivingSchools.value = [];
        schoolContextError.value = getApiFetchErrorMessage(
            e,
            'Nie udało się pobrać listy szkół jazdy.',
        );
    } finally {
        isSchoolContextLoading.value = false;
    }
}

watch(
    schoolId,
    (sid) => {
        if (sid) {
            loadSchoolContext();
            loadInstructors(sid);
        } else {
            drivingSchools.value = [];
            instructors.value = [];
        }
    },
    { immediate: true },
);

async function handleCourseSubmit(payload: CourseCreatePayload) {
    apiError.value = null;

    try {
        await createCourse(payload);

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
                    variant="outline"
                    type="button"
                    class="bg-background h-10 rounded-xl px-4 font-semibold shadow-sm"
                    disabled
                    aria-label="Bieżący tydzień"
                >
                    <CalendarDays class="size-4" aria-hidden="true" />
                    22-28 czerwca
                </UiButton>
                <UiButton
                    type="submit"
                    form="course-create-form"
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                    :disabled="isCreateLoading || schoolId === null"
                >
                    <Plus class="size-4" aria-hidden="true" />
                    Zapisz zmiany
                </UiButton>
            </template>
        </PageHeader>

        <p
            v-if="schoolId === null"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Brak parametru szkoły. Otwórz tę stronę z listy kursów (przycisk
            „Dodaj kurs”) lub dodaj
            <span class="font-mono">?schoolId=…</span> w adresie URL.
        </p>

        <template v-else>
            <p
                v-if="schoolContextError"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                {{ schoolContextError }}
            </p>

            <p
                v-else-if="schoolMissingFromContext"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                Nie znaleziono tej szkoły na liście Twoich OSK albo nie masz do
                niej dostępu. Wróć do listy kursów i wybierz szkołę ponownie.
            </p>

            <p
                v-if="instructorsLoadError"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                {{ instructorsLoadError }}
            </p>

            <CourseCreateForm
                v-if="!schoolContextError && !schoolMissingFromContext"
                id="course-create-form"
                :school-id="schoolId"
                :offered-course-types="offeredCourseTypes"
                :enabled-course-kinds="enabledCourseKinds"
                :is-school-context-loading="isSchoolContextLoading"
                :instructors="instructors"
                :is-instructors-loading="isInstructorsLoading"
                :is-saving="isCreateLoading"
                :api-error="apiError"
                @submit="handleCourseSubmit"
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
