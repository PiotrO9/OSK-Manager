<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { CourseListItem } from '~/types/courses/course';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

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
let schoolsLoadSeq = 0;
let coursesLoadSeq = 0;

async function loadSchools() {
    const seq = ++schoolsLoadSeq;

    schoolsLoadError.value = null;
    isSchoolsLoading.value = true;

    try {
        const items = await fetchSchoolsList();

        if (seq !== schoolsLoadSeq) {
            return;
        }

        schools.value = items;
    } catch (e) {
        if (seq !== schoolsLoadSeq) {
            return;
        }

        schoolsLoadError.value =
            e instanceof Error ? e.message : 'Nie udało się pobrać listy OSK.';
    } finally {
        if (seq === schoolsLoadSeq) {
            isSchoolsLoading.value = false;
        }
    }
}

function resolveInitialActiveSchoolId(): string {
    return schools.value[0]?.id ?? '';
}

async function loadCourses() {
    const sid = activeSchoolId.value.trim();
    const seq = ++coursesLoadSeq;

    if (!sid) {
        courses.value = [];

        return;
    }

    coursesLoadError.value = null;
    isCoursesLoading.value = true;

    try {
        const items = await fetchCoursesList(sid);

        if (seq !== coursesLoadSeq) {
            return;
        }

        courses.value = items;
    } catch (err) {
        if (seq !== coursesLoadSeq) {
            return;
        }

        courses.value = [];
        coursesLoadError.value = resolveCoursesListError(err);
    } finally {
        if (seq === coursesLoadSeq) {
            isCoursesLoading.value = false;
        }
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
