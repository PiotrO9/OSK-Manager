<script setup lang="ts">
import { ArrowLeft, BookOpen, User } from 'lucide-vue-next';
import type { InstructorListItem } from '~/types/instructor';
import {
    formatInstructorDisplayName,
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

const route = useRoute();
const { addToast } = useAppToast();
const { fetchById, isDetailLoading, patchCourse, isPatchLoading } =
    useCoursesApi();
const { fetchList: fetchInstructorsList } = useInstructorsApi();

const course = ref<CourseDetail | null>(null);
const loadError = ref<string | null>(null);
let fetchSeq = 0;

const instructors = ref<InstructorListItem[]>([]);
const instructorsLoadError = ref<string | null>(null);
const isInstructorsLoading = ref(false);

const selectedInstructorProfileId = ref('');
const isInstructorSelectionTouched = ref(false);

const schoolIdFromQuery = computed(() => {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') {
        return '';
    }

    const t = s.trim();

    return t;
});

const effectiveSchoolId = computed(() => {
    const q = schoolIdFromQuery.value;

    if (q.length > 0) {
        return q;
    }

    const sid = course.value?.schoolId?.trim();

    return sid && sid.length > 0 ? sid : '';
});

usePageMeta({
    title: () => course.value?.name?.trim() || 'Szczegóły kursu',
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
        selectedInstructorProfileId.value = '';

        return;
    }

    selectedInstructorProfileId.value =
        resolveInstructorProfileIdForCourseSelection(
            course.value.instructor,
            instructors.value,
        );
}

const resolvedInstructorProfileIdFromCourse = computed(() => {
    if (!course.value) {
        return '';
    }

    return resolveInstructorProfileIdForCourseSelection(
        course.value.instructor,
        instructors.value,
    );
});

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

        loadInstructors(sid);
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
    selectedInstructorProfileId.value = '';

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
        return 'Brak identyfikatora szkoły (dodaj ?schoolId=… w adresie lub otwórz link z listy kursów).';
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

    const sel = selectedInstructorProfileId.value.trim();
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

    const trimmed = selectedInstructorProfileId.value.trim();

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
            title: 'Błąd',
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
    <div class="space-y-6">
        <div>
            <NuxtLink
                to="/manager/courses"
                class="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2 text-sm"
                aria-label="Wróć do listy kursów"
            >
                <ArrowLeft class="size-4 shrink-0" aria-hidden="true" />
                Lista kursów
            </NuxtLink>
            <div class="space-y-1">
                <h1
                    class="text-foreground flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight"
                >
                    <BookOpen
                        class="text-muted-foreground size-7 shrink-0"
                        aria-hidden="true"
                    />
                    <span>{{ course?.name?.trim() || 'Szczegóły kursu' }}</span>
                </h1>
                <p class="text-muted-foreground text-sm">
                    Dane kursu i przypisanie instruktora z listy OSK.
                </p>
            </div>
        </div>

        <p
            v-if="isDetailLoading"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Wczytywanie danych kursu…
        </p>

        <p
            v-else-if="loadError"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ loadError }}
        </p>

        <template v-else-if="course">
            <div class="grid gap-6 md:grid-cols-1 lg:max-w-2xl">
                <UiCard aria-label="Dane kursu">
                    <UiCardHeader>
                        <UiCardTitle class="text-base">Dane kursu</UiCardTitle>
                    </UiCardHeader>
                    <UiCardContent>
                        <dl class="grid gap-3 text-sm">
                            <div class="grid gap-0.5">
                                <dt class="text-muted-foreground">Nazwa</dt>
                                <dd class="text-foreground font-medium">
                                    {{ course.name }}
                                </dd>
                            </div>
                            <div class="grid gap-0.5">
                                <dt class="text-muted-foreground">Kategoria</dt>
                                <dd class="text-foreground">
                                    {{ course.category }}
                                </dd>
                            </div>
                            <div class="grid gap-0.5">
                                <dt class="text-muted-foreground">Typ</dt>
                                <dd>
                                    <UiBadge variant="secondary" class="w-fit">
                                        {{ formatCourseKindLabel(course.type) }}
                                    </UiBadge>
                                </dd>
                            </div>
                            <div class="grid gap-0.5">
                                <dt class="text-muted-foreground">
                                    Liczba godzin
                                </dt>
                                <dd class="text-foreground tabular-nums">
                                    {{ course.totalHours }}
                                </dd>
                            </div>
                            <div class="grid gap-0.5">
                                <dt class="text-muted-foreground">
                                    Limit miejsc
                                </dt>
                                <dd class="text-foreground">
                                    {{ formatCapacityText(course.capacity) }}
                                </dd>
                            </div>
                        </dl>
                    </UiCardContent>
                </UiCard>

                <UiCard aria-label="Instruktor">
                    <UiCardHeader>
                        <UiCardTitle class="flex items-center gap-2 text-base">
                            <User
                                class="text-muted-foreground size-4"
                                aria-hidden="true"
                            />
                            Instruktor
                        </UiCardTitle>
                    </UiCardHeader>
                    <UiCardContent class="space-y-4">
                        <p class="text-muted-foreground text-xs">
                            Zapisany w kursie:
                            <span class="text-foreground font-medium">{{
                                formatInstructorName(course)
                            }}</span>
                        </p>

                        <p
                            v-if="instructorSaveBlockedReason"
                            class="text-sm text-amber-600 dark:text-amber-500"
                            role="status"
                        >
                            {{ instructorSaveBlockedReason }}
                        </p>

                        <p
                            v-if="instructorsLoadError"
                            class="text-destructive text-sm"
                            role="alert"
                            aria-live="polite"
                        >
                            {{ instructorsLoadError }}
                        </p>

                        <div class="space-y-2">
                            <UiLabel for="course-detail-instructor-select"
                                >Zmiana przypisania</UiLabel
                            >
                            <p
                                v-if="isInstructorsLoading"
                                class="text-muted-foreground text-sm"
                                role="status"
                            >
                                Wczytywanie listy instruktorów…
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
                                    class="w-full max-w-lg"
                                    aria-label="Wybierz instruktora przypisanego do kursu lub pozostaw bez wyboru"
                                >
                                    <UiSelectValue
                                        placeholder="— Brak instruktora —"
                                    />
                                </UiSelectTrigger>
                                <UiSelectContent>
                                    <UiSelectGroup>
                                        <UiSelectItem
                                            v-for="ins in instructors"
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
                                Brak instruktorów w tej szkole — możesz
                                wyczyścić przypisanie lub dodać instruktorów w
                                panelu OSK.
                            </p>
                        </div>

                        <UiButton
                            type="button"
                            :disabled="!canSaveInstructorAssignment"
                            :aria-busy="isPatchLoading"
                            @click="handleSaveInstructorAssignment"
                        >
                            {{
                                isPatchLoading
                                    ? 'Zapisywanie…'
                                    : 'Zapisz przypisanie'
                            }}
                        </UiButton>
                    </UiCardContent>
                </UiCard>
            </div>
        </template>
    </div>
</template>
