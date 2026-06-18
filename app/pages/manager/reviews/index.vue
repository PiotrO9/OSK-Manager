<script setup lang="ts">
import type { DrivingSchool } from '~/types/drivingSchool';
import type { InstructorListItem } from '~/types/instructor';
import type {
    LessonRatingListItem,
    LessonRatingsPeriod,
    LessonRatingsSummary,
} from '~/types/lessonRating';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Opinie',
    description: () => 'Wewnetrzna lista opinii o lekcjach praktycznych.',
});

const route = useRoute();
const { fetchList: fetchSchoolsList } = useDrivingSchoolsApi();
const { fetchList: fetchInstructorsList } = useInstructorsApi();
const { fetchManagerRatings } = useLessonRatingsListApi();

const schools = ref<DrivingSchool[]>([]);
const instructors = ref<InstructorListItem[]>([]);
const ratings = ref<LessonRatingListItem[]>([]);
const summary = ref<LessonRatingsSummary>({
    averageRating: null,
    totalCount: 0,
});

const activeSchoolId = ref('');
const activeInstructorId = ref('');
const activePeriod = ref<LessonRatingsPeriod>('latest');

const isSchoolsLoading = ref(false);
const isInstructorsLoading = ref(false);
const isRatingsLoading = ref(false);
const loadError = ref<string | null>(null);

function readQueryString(raw: unknown): string {
    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

function resolveInitialSchoolId(): string {
    const fromQuery = readQueryString(route.query.schoolId);

    if (fromQuery && schools.value.some((school) => school.id === fromQuery)) {
        return fromQuery;
    }

    const defaultSchool = schools.value.find((school) => school.isDefault);

    return defaultSchool?.id ?? schools.value[0]?.id ?? '';
}

function resolveInitialInstructorId(): string {
    const fromQuery = readQueryString(route.query.instructorId);

    if (
        fromQuery &&
        instructors.value.some((instructor) => instructor.id === fromQuery)
    ) {
        return fromQuery;
    }

    return '';
}

async function loadSchools(): Promise<void> {
    isSchoolsLoading.value = true;
    loadError.value = null;

    try {
        schools.value = await fetchSchoolsList();
        activeSchoolId.value = resolveInitialSchoolId();
    } catch (err) {
        schools.value = [];
        activeSchoolId.value = '';
        loadError.value = getApiFetchErrorMessage(
            err,
            'Nie udalo sie pobrac listy OSK.',
        );
    } finally {
        isSchoolsLoading.value = false;
    }
}

async function loadInstructors(): Promise<void> {
    const schoolId = activeSchoolId.value.trim();

    if (!schoolId) {
        instructors.value = [];
        activeInstructorId.value = '';

        return;
    }

    isInstructorsLoading.value = true;

    try {
        instructors.value = await fetchInstructorsList(schoolId);
        activeInstructorId.value = resolveInitialInstructorId();
    } catch {
        instructors.value = [];
        activeInstructorId.value = '';
    } finally {
        isInstructorsLoading.value = false;
    }
}

async function loadRatings(): Promise<void> {
    const schoolId = activeSchoolId.value.trim();

    if (!schoolId) {
        ratings.value = [];
        summary.value = { averageRating: null, totalCount: 0 };

        return;
    }

    isRatingsLoading.value = true;
    loadError.value = null;

    try {
        const payload = await fetchManagerRatings({
            schoolId,
            instructorId: activeInstructorId.value || undefined,
            period: activePeriod.value,
            limit: 50,
        });

        ratings.value = payload.ratings;
        summary.value = payload.summary;
    } catch (err) {
        ratings.value = [];
        summary.value = { averageRating: null, totalCount: 0 };
        loadError.value = getApiFetchErrorMessage(
            err,
            'Nie udalo sie pobrac opinii.',
        );
    } finally {
        isRatingsLoading.value = false;
    }
}

async function handleSchoolChange(schoolId: string): Promise<void> {
    activeSchoolId.value = schoolId;
    activeInstructorId.value = '';
    await loadInstructors();
    await loadRatings();
}

async function handleInstructorChange(instructorId: string): Promise<void> {
    activeInstructorId.value = instructorId;
    await loadRatings();
}

async function handlePeriodChange(period: LessonRatingsPeriod): Promise<void> {
    activePeriod.value = period;
    await loadRatings();
}

onMounted(async () => {
    await loadSchools();
    await loadInstructors();
    await loadRatings();
});
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Opinie
            </h1>
            <p class="text-muted-foreground text-sm">
                Wewnetrzny przeglad opinii po zakonczonych jazdach praktycznych.
            </p>
        </div>

        <p
            v-if="loadError"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ loadError }}
        </p>

        <p
            v-if="isSchoolsLoading"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Wczytywanie szkol jazdy...
        </p>

        <template v-else-if="schools.length > 0">
            <ManagerLessonRatingsFilters
                :schools="schools"
                :instructors="instructors"
                :school-id="activeSchoolId"
                :instructor-id="activeInstructorId"
                :period="activePeriod"
                :is-loading="isRatingsLoading"
                :is-instructors-loading="isInstructorsLoading"
                @school-change="handleSchoolChange"
                @instructor-change="handleInstructorChange"
                @period-change="handlePeriodChange"
            />

            <LessonRatingsSummary :summary="summary" />

            <LessonRatingsTable
                :ratings="ratings"
                :is-loading="isRatingsLoading"
                empty-label="Brak opinii dla wybranych filtrow"
            />
        </template>

        <p v-else class="text-muted-foreground text-sm" role="status">
            Brak szkol jazdy do wyswietlenia opinii.
        </p>
    </div>
</template>
