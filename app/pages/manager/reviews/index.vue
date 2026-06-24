<script setup lang="ts">
import { CalendarDays, Plus } from 'lucide-vue-next';
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
const activePeriod = ref<LessonRatingsPeriod>('last7days');

const isSchoolsLoading = ref(false);
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

function formatCurrentWeekLabel(): string {
    const today = new Date();
    const day = today.getDay();
    const offsetToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);

    monday.setDate(today.getDate() + offsetToMonday);

    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);

    const monthLabel = new Intl.DateTimeFormat('pl-PL', {
        month: 'long',
    }).format(sunday);

    return `${monday.getDate()}-${sunday.getDate()} ${monthLabel}`;
}

const periodOptions = computed<
    Array<{ value: LessonRatingsPeriod; label: string }>
>(() => [
    { value: 'latest', label: 'Ostatnie' },
    { value: 'yesterday', label: 'Wczoraj' },
    { value: 'last7days', label: formatCurrentWeekLabel() },
    { value: 'all', label: 'Wszystkie' },
]);

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
            'Nie udało się pobrać listy OSK.',
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

    try {
        instructors.value = await fetchInstructorsList(schoolId);
        activeInstructorId.value = resolveInitialInstructorId();
    } catch {
        instructors.value = [];
        activeInstructorId.value = '';
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
            'Nie udało się pobrać opinii.',
        );
    } finally {
        isRatingsLoading.value = false;
    }
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
    <div class="space-y-5">
        <div
            class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        >
            <div class="space-y-1.5">
                <h1
                    class="text-foreground text-2xl leading-tight font-bold tracking-tight md:text-3xl"
                >
                    Opinie o lekcjach
                </h1>
                <p class="text-muted-foreground text-sm">
                    Oceny instruktorów, komentarze kursantów i filtry okresu.
                </p>
            </div>

            <div class="flex flex-wrap gap-2">
                <UiSelect
                    :model-value="activePeriod"
                    :disabled="isRatingsLoading"
                    @update:model-value="
                        handlePeriodChange(
                            String($event) as LessonRatingsPeriod,
                        )
                    "
                >
                    <UiSelectTrigger
                        class="bg-card h-10 w-auto min-w-36 gap-2 rounded-xl px-3 font-semibold shadow-xs"
                        aria-label="Wybierz okres opinii"
                    >
                        <CalendarDays class="size-4" aria-hidden="true" />
                        <UiSelectValue placeholder="Okres" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem
                                v-for="option in periodOptions"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>

                <UiButton as-child class="h-10 rounded-xl px-4 shadow-lg">
                    <NuxtLink
                        to="/events"
                        aria-label="Przejdz do dodawania jazdy"
                    >
                        <Plus class="size-4" aria-hidden="true" />
                        Dodaj jazde
                    </NuxtLink>
                </UiButton>
            </div>
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
            Wczytywanie szkół jazdy...
        </p>

        <template v-else-if="schools.length > 0">
            <div class="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                <LessonRatingsSummary :summary="summary" />

                <LessonRatingsTable
                    :ratings="ratings"
                    :is-loading="isRatingsLoading"
                    empty-label="Brak opinii dla wybranego okresu"
                />
            </div>
        </template>

        <p v-else class="text-muted-foreground text-sm" role="status">
            Brak szkół jazdy do wyświetlenia opinii.
        </p>
    </div>
</template>
