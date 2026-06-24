<script setup lang="ts">
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    GraduationCap,
    ListChecks,
    Plus,
    Settings2,
    User,
} from 'lucide-vue-next';
import type { InstructorListItem } from '~/types/instructor';
import {
    formatInstructorDisplayName,
    instructorHasCourseCategoryQualification,
    resolveInstructorProfileIdForCourseSelection,
} from '~/types/instructor';
import { formatCourseKindLabel, type CourseDetail } from '~/types/course';
import { useAppToast } from '~/composables/useAppToast';
import { getApiErrorStatusCode } from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const NO_INSTRUCTOR_VALUE = '__no_instructor__';

const route = useRoute();
const { addToast } = useAppToast();
const { fetchById, isDetailLoading, patchCourse, isPatchLoading } =
    useCoursesApi();
const { fetchList: fetchInstructorsList } = useInstructorsApi();

const course = ref<CourseDetail | null>(null);
const loadError = shallowRef<string | null>(null);
let fetchSeq = 0;

const instructors = ref<InstructorListItem[]>([]);
const instructorsLoadError = shallowRef<string | null>(null);
const isInstructorsLoading = shallowRef(false);

const selectedInstructorProfileId = shallowRef(NO_INSTRUCTOR_VALUE);
const isInstructorSelectionTouched = shallowRef(false);

const qualifiedInstructors = computed((): InstructorListItem[] => {
    const categoryCode =
        course.value?.courseType?.code?.trim() || course.value?.category || '';

    if (!categoryCode.trim()) {
        return [];
    }

    return instructors.value.filter((instructor) =>
        instructorHasCourseCategoryQualification(instructor, categoryCode),
    );
});

const schoolIdFromQuery = computed(() => {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') {
        return '';
    }

    return s.trim();
});

const effectiveSchoolId = computed(() => {
    const q = schoolIdFromQuery.value;

    if (q.length > 0) {
        return q;
    }

    const sid = course.value?.schoolId?.trim();

    return sid && sid.length > 0 ? sid : '';
});

const backToCoursesHref = computed(() => {
    if (!effectiveSchoolId.value) {
        return '/manager/courses';
    }

    return {
        path: '/manager/courses',
        query: { schoolId: effectiveSchoolId.value },
    };
});

const createCourseTarget = computed(() => ({
    path: '/manager/courses/new',
    query: effectiveSchoolId.value ? { schoolId: effectiveSchoolId.value } : {},
}));

const courseTitle = computed(
    () => course.value?.name?.trim() || 'Szczegóły kursu',
);

const courseCategoryLabel = computed(() => {
    const category = course.value?.courseType?.label?.trim();

    if (category) {
        return category;
    }

    return course.value?.category?.trim() || '--';
});

const courseSubtitle = computed(() => {
    if (!course.value) {
        return 'Parametry kursu, kursanci, godziny i ustawienia.';
    }

    return `Kategoria ${courseCategoryLabel.value} - aktywny kurs`;
});

const courseInitials = computed(() => {
    const source = course.value?.name?.trim() || course.value?.category || 'K';
    const initials = source
        .split(/\s+/)
        .filter((part) => part.length > 0)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('');

    return initials.length > 0 ? initials.toUpperCase() : 'K';
});

const resolvedInstructorProfileIdFromCourse = computed(() => {
    if (!course.value) {
        return '';
    }

    return resolveInstructorProfileIdForCourseSelection(
        course.value.instructor,
        qualifiedInstructors.value,
    );
});

const selectedInstructorPatchValue = computed(() => {
    const value = selectedInstructorProfileId.value.trim();

    return value === NO_INSTRUCTOR_VALUE ? '' : value;
});

const overviewItems = computed(() => {
    if (!course.value) {
        return [];
    }

    return [
        {
            label: 'Godziny kursu',
            description: `${course.value.totalHours} h lacznie`,
            badge: `${course.value.totalHours} h`,
            tone: 'info' as const,
        },
        {
            label: 'Typ kursu',
            description: 'Rodzaj zajec i organizacji kursu.',
            badge: formatCourseKindLabel(course.value.type),
            tone: 'neutral' as const,
        },
        {
            label: 'Limit miejsc',
            description: 'Maksymalna liczba uczestnikow.',
            badge: formatCapacityText(course.value.capacity),
            tone:
                course.value.capacity === null
                    ? ('neutral' as const)
                    : ('success' as const),
        },
    ];
});

const relatedItems = computed(() => {
    if (!course.value) {
        return [];
    }

    return [
        {
            label: 'Instruktor',
            description: 'Przypisanie edytowane w panelu obok.',
            badge: formatInstructorName(course.value),
        },
        {
            label: 'Kategoria',
            description: 'Zachowana w konfiguracji kursu.',
            badge: courseCategoryLabel.value,
        },
        {
            label: 'OSK',
            description: 'Kontekst pobrany z linku lub danych kursu.',
            badge: effectiveSchoolId.value ? 'Powiazane' : 'Brak ID',
        },
    ];
});

usePageMeta({
    title: () => courseTitle.value,
    description: () => 'Dane kursu i przypisanie instruktora.',
});

function getRouteIdString(rawId: unknown): string {
    if (typeof rawId === 'string') {
        return rawId.trim();
    }

    if (Array.isArray(rawId)) {
        return String(rawId[0] ?? '').trim();
    }

    return '';
}

function resolveCourseDetailError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak dostępu do szczegółów tego kursu.';
    }

    if (status === 404) {
        return 'Nie znaleziono kursu.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(err, 'Nie udało się wczytać danych kursu.');
}

function formatCapacityText(capacity: number | null): string {
    if (capacity === null) {
        return 'Brak limitu';
    }

    return String(capacity);
}

function formatInstructorName(c: CourseDetail): string {
    const name = c.instructor?.name?.trim();

    if (name && name.length > 0) {
        return name;
    }

    return 'Brak instruktora';
}

function applySelectionFromCourse() {
    if (!course.value) {
        selectedInstructorProfileId.value = NO_INSTRUCTOR_VALUE;

        return;
    }

    const resolved = resolveInstructorProfileIdForCourseSelection(
        course.value.instructor,
        qualifiedInstructors.value,
    );

    selectedInstructorProfileId.value =
        resolved.length > 0 ? resolved : NO_INSTRUCTOR_VALUE;
}

async function loadInstructors(schoolId: string) {
    instructorsLoadError.value = null;
    isInstructorsLoading.value = true;

    try {
        instructors.value = await fetchInstructorsList(schoolId);
    } catch (e) {
        instructors.value = [];
        instructorsLoadError.value = getApiFetchErrorMessage(
            e,
            'Nie udało się pobrać listy instruktorów.',
        );
    } finally {
        isInstructorsLoading.value = false;
    }

    if (!isInstructorSelectionTouched.value) {
        applySelectionFromCourse();
    }
}

watch(
    effectiveSchoolId,
    (sid) => {
        if (!sid) {
            instructors.value = [];
            instructorsLoadError.value = null;

            return;
        }

        void loadInstructors(sid);
    },
    { immediate: true },
);

async function loadCourse(rawId: unknown) {
    loadError.value = null;

    const id = getRouteIdString(rawId);

    if (!id) {
        course.value = null;
        loadError.value = 'Nie znaleziono kursu.';

        return;
    }

    const seq = ++fetchSeq;

    course.value = null;
    isInstructorSelectionTouched.value = false;
    selectedInstructorProfileId.value = NO_INSTRUCTOR_VALUE;

    try {
        const data = await fetchById(id);

        if (seq !== fetchSeq) {
            return;
        }

        course.value = data;
        applySelectionFromCourse();
    } catch (err: unknown) {
        if (seq !== fetchSeq) {
            return;
        }

        course.value = null;
        loadError.value = resolveCourseDetailError(err);
    }
}

watch(
    () => route.params.id,
    async (id) => {
        await loadCourse(id);
    },
    { immediate: true },
);

function handleInstructorSelectChange() {
    isInstructorSelectionTouched.value = true;
}

const instructorSaveBlockedReason = computed(() => {
    if (!effectiveSchoolId.value) {
        return 'Brak identyfikatora szkoły. Otwórz szczegóły z listy kursów albo dodaj parametr schoolId w adresie.';
    }

    return '';
});

const canSaveInstructorAssignment = computed(() => {
    if (!course.value || instructorSaveBlockedReason.value.length > 0) {
        return false;
    }

    if (isPatchLoading.value || isInstructorsLoading.value) {
        return false;
    }

    const sel = selectedInstructorPatchValue.value;
    const cur = resolvedInstructorProfileIdFromCourse.value.trim();

    if (sel === cur) {
        return false;
    }

    return true;
});

async function handleSaveInstructorAssignment() {
    const id = getRouteIdString(route.params.id);

    if (!id || !course.value || !canSaveInstructorAssignment.value) {
        return;
    }

    const trimmed = selectedInstructorPatchValue.value;

    try {
        const updated = await patchCourse(id, {
            instructorId: trimmed.length > 0 ? trimmed : null,
        });

        course.value = updated;
        isInstructorSelectionTouched.value = false;
        applySelectionFromCourse();

        addToast({
            title: 'Instruktor zaktualizowany',
            variant: 'success',
        });
    } catch (err) {
        addToast({
            title: 'Blad',
            description: getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać instruktora.',
            ),
            variant: 'error',
        });
    }
}
</script>

<template>
    <div class="space-y-5">
        <PageHeader :title="courseTitle" :description="courseSubtitle">
            <template #actions>
                <UiButton
                    as-child
                    variant="outline"
                    class="bg-background h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        :to="backToCoursesHref"
                        aria-label="Wróć do listy kursów"
                    >
                        <ArrowLeft class="mr-2 size-4" aria-hidden="true" />
                        Lista kursów
                    </NuxtLink>
                </UiButton>
                <UiButton
                    as-child
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        :to="createCourseTarget"
                        aria-label="Dodaj nowy kurs"
                    >
                        <Plus class="mr-2 size-4" aria-hidden="true" />
                        Dodaj kurs
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

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
                <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                    <UiCardContent class="space-y-5 p-5">
                        <div class="flex items-start gap-4 xl:flex-col">
                            <div
                                class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-xl font-extrabold text-sky-700"
                                aria-hidden="true"
                            >
                                {{ courseInitials }}
                            </div>
                            <div class="min-w-0">
                                <h2
                                    class="text-foreground truncate text-xl font-extrabold"
                                >
                                    {{ course.name }}
                                </h2>
                                <p class="text-muted-foreground mt-1 text-sm">
                                    {{ courseSubtitle }}
                                </p>
                            </div>
                        </div>

                        <dl class="divide-border divide-y">
                            <div
                                class="flex items-center justify-between gap-4 py-3"
                            >
                                <dt
                                    class="text-muted-foreground flex items-center gap-2 text-sm"
                                >
                                    <CheckCircle2
                                        class="size-4"
                                        aria-hidden="true"
                                    />
                                    Status
                                </dt>
                                <dd class="text-right text-sm font-bold">
                                    Aktywny
                                </dd>
                            </div>
                            <div
                                class="flex items-center justify-between gap-4 py-3"
                            >
                                <dt
                                    class="text-muted-foreground flex items-center gap-2 text-sm"
                                >
                                    <BookOpen
                                        class="size-4"
                                        aria-hidden="true"
                                    />
                                    Kategoria
                                </dt>
                                <dd
                                    class="max-w-[170px] truncate text-right text-sm font-bold"
                                >
                                    {{ courseCategoryLabel }}
                                </dd>
                            </div>
                            <div
                                class="flex items-center justify-between gap-4 py-3"
                            >
                                <dt
                                    class="text-muted-foreground flex items-center gap-2 text-sm"
                                >
                                    <Settings2
                                        class="size-4"
                                        aria-hidden="true"
                                    />
                                    Typ
                                </dt>
                                <dd class="text-right text-sm font-bold">
                                    {{ formatCourseKindLabel(course.type) }}
                                </dd>
                            </div>
                            <div
                                class="flex items-center justify-between gap-4 py-3"
                            >
                                <dt
                                    class="text-muted-foreground flex items-center gap-2 text-sm"
                                >
                                    <GraduationCap
                                        class="size-4"
                                        aria-hidden="true"
                                    />
                                    Instruktor
                                </dt>
                                <dd
                                    class="max-w-[170px] truncate text-right text-sm font-bold"
                                >
                                    {{ formatInstructorName(course) }}
                                </dd>
                            </div>
                        </dl>
                    </UiCardContent>
                </UiCard>

                <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                    <UiCardHeader class="border-border border-b p-5">
                        <div
                            class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                        >
                            <div class="space-y-1">
                                <UiCardTitle class="text-xl font-extrabold">
                                    Przeglad
                                </UiCardTitle>
                                <UiCardDescription>
                                    Najwazniejsze dane i akcje dla tego widoku.
                                </UiCardDescription>
                            </div>
                            <StatusBadge label="Aktualne" tone="info" subtle />
                        </div>
                    </UiCardHeader>
                    <UiCardContent class="grid gap-3 p-4">
                        <div
                            v-for="item in overviewItems"
                            :key="item.label"
                            class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between"
                        >
                            <div class="min-w-0">
                                <p class="font-extrabold">{{ item.label }}</p>
                                <p class="text-muted-foreground mt-1 text-sm">
                                    {{ item.description }}
                                </p>
                            </div>
                            <StatusBadge
                                :label="item.badge"
                                :tone="item.tone"
                                subtle
                            />
                        </div>
                    </UiCardContent>
                </UiCard>
            </div>

            <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                    <UiCardHeader class="border-border border-b p-5">
                        <div class="flex items-start justify-between gap-3">
                            <div class="space-y-1">
                                <UiCardTitle class="text-xl font-extrabold">
                                    Przypisanie instruktora
                                </UiCardTitle>
                                <UiCardDescription>
                                    Aktualizuj prowadzącego z listy instruktorów
                                    tej OSK.
                                </UiCardDescription>
                            </div>
                            <User
                                class="text-muted-foreground size-5 shrink-0"
                                aria-hidden="true"
                            />
                        </div>
                    </UiCardHeader>
                    <UiCardContent class="space-y-5 p-5">
                        <div class="border-border rounded-2xl border p-4">
                            <div
                                class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                            >
                                <div class="min-w-0">
                                    <p class="font-extrabold">
                                        Zapisany w kursie
                                    </p>
                                    <p
                                        class="text-muted-foreground mt-1 text-sm"
                                    >
                                        To przypisanie jest używane przy
                                        organizacji zajec.
                                    </p>
                                </div>
                                <StatusBadge
                                    :label="formatInstructorName(course)"
                                    :tone="
                                        course.instructor
                                            ? 'success'
                                            : 'neutral'
                                    "
                                    subtle
                                />
                            </div>
                        </div>

                        <p
                            v-if="instructorSaveBlockedReason"
                            class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700"
                            role="status"
                        >
                            {{ instructorSaveBlockedReason }}
                        </p>

                        <ErrorState
                            v-if="instructorsLoadError"
                            title="Nie udało się wczytać instruktorów"
                            :description="instructorsLoadError"
                            @retry="loadInstructors(effectiveSchoolId)"
                        />

                        <div class="space-y-2">
                            <UiLabel for="course-detail-instructor-select">
                                Zmiana przypisania
                            </UiLabel>
                            <p
                                v-if="isInstructorsLoading"
                                class="text-muted-foreground text-sm"
                                role="status"
                            >
                                Wczytywanie listy instruktorów...
                            </p>
                            <UiSelect
                                v-else
                                v-model="selectedInstructorProfileId"
                                :disabled="
                                    !!instructorSaveBlockedReason ||
                                    isPatchLoading
                                "
                                @update:model-value="
                                    handleInstructorSelectChange
                                "
                            >
                                <UiSelectTrigger
                                    id="course-detail-instructor-select"
                                    class="h-11 w-full rounded-xl"
                                    aria-label="Wybierz instruktora przypisanego do kursu lub pozostaw bez wyboru"
                                >
                                    <UiSelectValue
                                        placeholder="Brak instruktora"
                                    />
                                </UiSelectTrigger>
                                <UiSelectContent>
                                    <UiSelectGroup>
                                        <UiSelectItem
                                            :value="NO_INSTRUCTOR_VALUE"
                                        >
                                            Brak instruktora
                                        </UiSelectItem>
                                        <UiSelectItem
                                            v-for="ins in qualifiedInstructors"
                                            :key="ins.id"
                                            :value="ins.id"
                                        >
                                            {{ formatInstructorDisplayName(ins)
                                            }}{{
                                                ins.email &&
                                                ins.email.length > 0
                                                    ? ` (${ins.email})`
                                                    : ''
                                            }}
                                        </UiSelectItem>
                                    </UiSelectGroup>
                                </UiSelectContent>
                            </UiSelect>
                            <p
                                v-if="
                                    !isInstructorsLoading &&
                                    effectiveSchoolId &&
                                    instructors.length === 0
                                "
                                class="text-muted-foreground text-sm"
                                role="status"
                            >
                                Brak instruktorów w tej szkole. Możesz wyczyścić
                                przypisanie albo dodać instruktorów w panelu
                                OSK.
                            </p>
                            <p
                                v-else-if="
                                    !isInstructorsLoading &&
                                    effectiveSchoolId &&
                                    qualifiedInstructors.length === 0
                                "
                                class="text-muted-foreground text-sm"
                                role="status"
                            >
                                Brak instruktorów z uprawnieniem do kategorii
                                tego kursu.
                            </p>
                        </div>

                        <UiButton
                            type="button"
                            class="h-10 rounded-xl px-4 font-semibold"
                            :disabled="!canSaveInstructorAssignment"
                            :aria-busy="isPatchLoading"
                            @click="handleSaveInstructorAssignment"
                        >
                            {{
                                isPatchLoading
                                    ? 'Zapisywanie...'
                                    : 'Zapisz przypisanie'
                            }}
                        </UiButton>
                    </UiCardContent>
                </UiCard>

                <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                    <UiCardHeader class="border-border border-b p-5">
                        <div class="flex items-start justify-between gap-3">
                            <div class="space-y-1">
                                <UiCardTitle class="text-xl font-extrabold">
                                    Powiazane dane
                                </UiCardTitle>
                                <UiCardDescription>
                                    Elementy, ktorych nie można zgubic po
                                    redesignie.
                                </UiCardDescription>
                            </div>
                            <ListChecks
                                class="text-muted-foreground size-5 shrink-0"
                                aria-hidden="true"
                            />
                        </div>
                    </UiCardHeader>
                    <UiCardContent class="grid gap-3 p-4">
                        <div
                            v-for="item in relatedItems"
                            :key="item.label"
                            class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between"
                        >
                            <div class="min-w-0">
                                <p class="font-extrabold">{{ item.label }}</p>
                                <p class="text-muted-foreground mt-1 text-sm">
                                    {{ item.description }}
                                </p>
                            </div>
                            <StatusBadge :label="item.badge" subtle />
                        </div>
                    </UiCardContent>
                </UiCard>
            </div>
        </template>
    </div>
</template>
