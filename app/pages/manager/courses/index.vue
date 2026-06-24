<script setup lang="ts">
import type { DrivingSchool } from '~/types/drivingSchool';
import type { CourseListItem } from '~/types/course';
import { getApiErrorStatusCode } from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Kursy',
    description: () => 'Lista kursów w wybranej szkole jazdy.',
});

function resolveCoursesListError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak dostępu do listy kursów dla wybranej szkoły.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(err, 'Nie udało się pobrać listy kursów.');
}

const { fetchList: fetchSchoolsList } = useDrivingSchoolsApi();
const { fetchList: fetchCoursesList } = useCoursesApi();

const schools = ref<DrivingSchool[]>([]);
const schoolsLoadError = ref<string | null>(null);
const isSchoolsLoading = ref(false);

const activeSchoolId = ref('');
const courses = ref<CourseListItem[]>([]);
const isCoursesLoading = ref(false);
const coursesLoadError = ref<string | null>(null);

async function loadSchools() {
    schoolsLoadError.value = null;
    isSchoolsLoading.value = true;

    try {
        schools.value = await fetchSchoolsList();
    } catch (e) {
        schoolsLoadError.value =
            e instanceof Error ? e.message : 'Nie udało się pobrać listy OSK.';
    } finally {
        isSchoolsLoading.value = false;
    }
}

function resolveInitialActiveSchoolId(): string {
    return schools.value[0]?.id ?? '';
}

async function loadCourses() {
    const sid = activeSchoolId.value.trim();

    if (!sid) {
        courses.value = [];

        return;
    }

    coursesLoadError.value = null;
    isCoursesLoading.value = true;

    try {
        courses.value = await fetchCoursesList(sid);
    } catch (err) {
        courses.value = [];
        coursesLoadError.value = resolveCoursesListError(err);
    } finally {
        isCoursesLoading.value = false;
    }
}

async function handleActiveSchoolChange(value: string) {
    activeSchoolId.value = value;
    coursesLoadError.value = null;
    await loadCourses();
}

onMounted(async () => {
    await loadSchools();
    activeSchoolId.value = resolveInitialActiveSchoolId();

    if (activeSchoolId.value) {
        await loadCourses();
    }
});
</script>

<template>
    <ManagerCoursesListPanel
        :schools="schools"
        :courses="courses"
        :active-school-id="activeSchoolId"
        :is-schools-loading="isSchoolsLoading"
        :is-courses-loading="isCoursesLoading"
        :schools-load-error="schoolsLoadError"
        :courses-load-error="coursesLoadError"
        @active-school-change="handleActiveSchoolChange"
        @retry-schools="loadSchools"
        @retry-courses="loadCourses"
    />
</template>
