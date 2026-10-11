<script setup lang="ts">
import type {
    CourseCreatePayload,
    CourseDetail,
    CoursePatchPayload,
} from '~/types/courses/course';
import type {
    DrivingSchool,
    OfferedCourseType,
} from '~/types/schools/drivingSchool';
import type { InstructorListItem } from '~/types/instructors/instructor';
import { resolveInstructorProfileIdForCourseSelection } from '~/types/instructors/instructor';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

definePageMeta({ layout: 'app-shell', middleware: ['manager'] });
usePageMeta({
    title: () => 'Edytuj kurs',
    description: () => 'Zmień dane kursu.',
});

const route = useRoute();
const { fetchById, patchCourse, isPatchLoading } = useCoursesApi();
const { fetchList: fetchSchools } = useDrivingSchoolsApi();
const { fetchList: fetchInstructors } = useInstructorsApi();
const { addToast } = useAppToast();
const course = ref<CourseDetail | null>(null);
const school = ref<DrivingSchool | null>(null);
const instructors = ref<InstructorListItem[]>([]);
const isLoading = ref(true);
const loadError = ref<string | null>(null);
const saveError = ref<string | null>(null);
const isSaved = ref(false);

const courseId = computed(() => String(route.params.id ?? ''));
const detailPath = computed(() => `/manager/courses/${courseId.value}`);
const offeredCourseTypes = computed<OfferedCourseType[]>(() => {
    const offered = school.value?.offeredCourseTypes ?? [];

    if (
        !course.value ||
        offered.some((item) => item.code === course.value?.category)
    )
        return offered;

    return [
        ...offered,
        {
            id: course.value.courseType?.id ?? course.value.category,
            code: course.value.category,
            name: course.value.courseType?.name ?? course.value.category,
        },
    ];
});
const enabledCourseKinds = computed(
    () => school.value?.enabledCourseKinds ?? [],
);
const initialInstructorId = computed(() =>
    resolveInstructorProfileIdForCourseSelection(
        course.value?.instructor,
        instructors.value,
    ),
);

async function load() {
    isLoading.value = true;
    loadError.value = null;
    course.value = null;

    try {
        const loadedCourse = await fetchById(courseId.value);

        if (!loadedCourse.schoolId)
            throw new Error('Nie można ustalić szkoły kursu.');

        const [schools, schoolInstructors] = await Promise.all([
            fetchSchools(),
            fetchInstructors(loadedCourse.schoolId),
        ]);
        const selectedSchool = schools.find(
            (item) => item.id === loadedCourse.schoolId,
        );

        if (!selectedSchool)
            throw new Error('Nie znaleziono szkoły przypisanej do kursu.');

        course.value = loadedCourse;
        school.value = selectedSchool;
        instructors.value = schoolInstructors;
    } catch (error) {
        loadError.value = getApiFetchErrorMessage(
            error,
            'Nie udało się wczytać kursu.',
        );
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => void load());
watch(courseId, () => void load());

async function handleSubmit(payload: CourseCreatePayload) {
    if (!course.value || isPatchLoading.value) return;

    saveError.value = null;

    const current = course.value;
    const changes: CoursePatchPayload = {};

    if (payload.name !== current.name) changes.name = payload.name;

    if (payload.category !== current.category)
        changes.category = payload.category;

    if (payload.kind !== current.type) changes.kind = payload.kind;

    if (payload.totalHours !== current.totalHours)
        changes.totalHours = payload.totalHours;

    if (
        (payload.instructorId ?? null) !== (initialInstructorId.value || null)
    ) {
        changes.instructorId = payload.instructorId ?? null;
    }

    if (payload.kind === 'THEORY_GROUP') {
        const capacity = payload.capacity ?? null;

        if (capacity !== current.capacity) changes.capacity = capacity;

        if (payload.theoryStartDate !== current.theoryStartDate)
            changes.theoryStartDate = payload.theoryStartDate ?? null;

        if (payload.theoryEndDate !== current.theoryEndDate)
            changes.theoryEndDate = payload.theoryEndDate ?? null;
    } else if (current.type === 'THEORY_GROUP') {
        changes.capacity = null;
        changes.theoryStartDate = null;
        changes.theoryEndDate = null;
    }

    if (Object.keys(changes).length === 0) {
        isSaved.value = true;
        await navigateTo(detailPath.value);

        return;
    }

    try {
        await patchCourse(current.id, changes);
        isSaved.value = true;
        addToast({
            title: 'Zmiany kursu zostały zapisane',
            variant: 'success',
        });
        await navigateTo(detailPath.value, { replace: true });
    } catch (error) {
        saveError.value = getApiFetchErrorMessage(
            error,
            'Nie udało się zapisać zmian kursu.',
        );
    }
}
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Edytuj kurs"
            description="Zmień dane kursu i zapisz zmiany."
        >
            <template #actions>
                <UiButton
                    v-if="course"
                    type="submit"
                    form="course-edit-form"
                    :disabled="isPatchLoading"
                    :aria-busy="isPatchLoading"
                >
                    {{ isPatchLoading ? 'Zapisywanie…' : 'Zapisz zmiany' }}
                </UiButton>
            </template>
        </PageHeader>
        <LoadingState
            v-if="isLoading"
            title="Wczytywanie kursu"
            description="Pobieram dane kursu do edycji."
        />
        <div
            v-else-if="loadError"
            class="border-border bg-background rounded-2xl border p-6"
            role="alert"
        >
            <p class="text-destructive">{{ loadError }}</p>
            <UiButton variant="outline" class="mt-4" @click="load"
                >Spróbuj ponownie</UiButton
            >
        </div>
        <template v-else-if="course && school">
            <div class="border-border bg-card rounded-xl border px-4 py-3">
                <SchoolContext :school="school" />
            </div>
            <CourseCreateForm
                id="course-edit-form"
                :key="course.id"
                :school-id="school.id"
                :offered-course-types="offeredCourseTypes"
                :enabled-course-kinds="enabledCourseKinds"
                :is-school-context-loading="false"
                :instructors="instructors"
                :is-instructors-loading="false"
                :instructors-load-error="null"
                :is-saving="isPatchLoading"
                :is-created="isSaved"
                :api-error="saveError"
                :initial-course="course"
                :initial-instructor-id="initialInstructorId"
                @submit="handleSubmit"
            />
        </template>
        <NuxtLink
            :to="detailPath"
            class="text-primary inline-flex text-sm font-medium hover:underline"
            >Wróć do szczegółów kursu</NuxtLink
        >
    </div>
</template>
