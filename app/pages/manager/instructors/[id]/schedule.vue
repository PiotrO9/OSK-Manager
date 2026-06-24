<script setup lang="ts">
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Clock,
    Layers3,
    Plus,
    Route,
} from 'lucide-vue-next';
import { getMonday, weekRangeFromMonday } from '~/utils/weeklyCalendarDates';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import type { CourseListItem } from '~/types/course';
import type { ScheduleLessonItem } from '~/types/schedule';
import type { Vehicle } from '~/types/vehicle';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const { addToast } = useAppToast();
const { fetchScheduleForInstructor } = useScheduleApi();
const {
    createInstructorEvent,
    deleteInstructorEvent,
    isLoading: isEventSaving,
    isDeleteLoading: isEventDeleteLoading,
} = useInstructorEventsApi();
const { fetchList: fetchVehiclesList } = useVehiclesApi();
const { fetchList: fetchCoursesList } = useCoursesApi();

function getInstructorId(): string {
    const raw = route.params.id;

    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

function readSchoolIdFromQuery(): string {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') {
        return '';
    }

    return s.trim();
}

const instructorId = computed(getInstructorId);
const schoolId = computed(readSchoolIdFromQuery);

usePageMeta({
    title: () => 'Terminarz instruktora',
    description: () => 'Tygodniowy harmonogram jazd, teorii i blokad.',
});

const weekStart = ref<Date>(getMonday(new Date()));
const items = ref<ScheduleLessonItem[]>([]);
const isScheduleLoading = ref(false);
const scheduleError = ref<string | null>(null);

const vehicles = ref<Vehicle[]>([]);
const vehiclesError = ref<string | null>(null);
const isVehiclesLoading = ref(false);

const courses = ref<CourseListItem[]>([]);
const coursesError = ref<string | null>(null);
const isCoursesLoading = ref(false);

const eventType = ref<'THEORY' | 'DRIVE'>('THEORY');
const eventStartLocal = ref('');
const eventEndLocal = ref('');
const eventVehicleId = ref('');
const eventCourseId = ref('');
const eventFormError = ref<string | null>(null);

const deleteDialogOpen = ref(false);
const pendingDeleteItem = ref<ScheduleLessonItem | null>(null);

const range = computed(() => weekRangeFromMonday(weekStart.value));
const scheduleItemsCount = computed(() => items.value.length);
const lessonItemsCount = computed(
    () => items.value.filter((item) => item.kind !== 'instructor_event').length,
);
const blockItemsCount = computed(
    () => items.value.filter((item) => item.kind === 'instructor_event').length,
);
const scheduleWeekLabel = computed(() =>
    formatWeekRangeCompact(weekStart.value),
);
const scheduleResultLabel = computed(() => {
    if (isScheduleLoading.value) {
        return 'Wczytywanie';
    }

    return `${scheduleItemsCount.value} wpisow`;
});
const nextScheduledItemLabel = computed(() => {
    const item = items.value
        .slice()
        .sort(
            (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime(),
        )[0];

    if (!item) {
        return 'Brak';
    }

    return formatScheduleRangeLabel(item.startTime);
});

const pendingDeleteTimeLabel = computed(() => {
    const item = pendingDeleteItem.value;

    if (!item) {
        return '';
    }

    return `${formatScheduleRangeLabel(item.startTime)} - ${formatScheduleRangeLabel(item.endTime)}`;
});

function formatScheduleRangeLabel(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(d);
}

function formatWeekRangeCompact(monday: Date): string {
    const start = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate(),
    );
    const end = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + 6,
    );
    const startDay = new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
    }).format(start);
    const endLabel = new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
    }).format(end);

    return `${startDay}-${endLabel}`;
}

let scheduleSeq = 0;

async function loadSchedule(): Promise<void> {
    const id = instructorId.value;

    if (!id) {
        items.value = [];

        return;
    }

    const seq = ++scheduleSeq;

    scheduleError.value = null;
    isScheduleLoading.value = true;

    const { dateFrom, dateTo } = range.value;

    try {
        const data = await fetchScheduleForInstructor(id, dateFrom, dateTo);

        if (seq !== scheduleSeq) {
            return;
        }

        items.value = data;
    } catch (err: unknown) {
        if (seq !== scheduleSeq) {
            return;
        }

        items.value = [];
        scheduleError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się wczytać terminarza lekcji.',
        );
    } finally {
        if (seq === scheduleSeq) {
            isScheduleLoading.value = false;
        }
    }
}

async function loadVehicles(): Promise<void> {
    const sid = schoolId.value;

    vehiclesError.value = null;
    vehicles.value = [];

    if (!sid) {
        return;
    }

    isVehiclesLoading.value = true;

    try {
        vehicles.value = await fetchVehiclesList(sid);
    } catch (err: unknown) {
        vehiclesError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się pobrać listy pojazdów.',
        );
    } finally {
        isVehiclesLoading.value = false;
    }
}

async function loadCourses(): Promise<void> {
    const sid = schoolId.value;

    coursesError.value = null;
    courses.value = [];

    if (!sid) {
        return;
    }

    isCoursesLoading.value = true;

    try {
        courses.value = await fetchCoursesList(sid);
    } catch (err: unknown) {
        coursesError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się pobrać listy kursów.',
        );
    } finally {
        isCoursesLoading.value = false;
    }
}

watch(
    [range, instructorId],
    () => {
        void loadSchedule();
    },
    { immediate: true },
);

watch(
    schoolId,
    () => {
        void loadVehicles();
        void loadCourses();
    },
    { immediate: true },
);

function handlePrevWeek(): void {
    const d = new Date(weekStart.value);

    d.setDate(d.getDate() - 7);
    weekStart.value = getMonday(d);
}

function handleNextWeek(): void {
    const d = new Date(weekStart.value);

    d.setDate(d.getDate() + 7);
    weekStart.value = getMonday(d);
}

function handleInstructorEventStatusChanged(payload: {
    id: string;
    status: string;
}): void {
    const idx = items.value.findIndex((x) => x.id === payload.id);

    if (idx < 0) {
        return;
    }

    const row = items.value[idx];

    if (!row) {
        return;
    }

    const copy = items.value.slice();

    copy[idx] = { ...row, status: payload.status };
    items.value = copy;
}

function formatWeekLabel(d: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
}

function handleFocusEventForm(): void {
    const target = document.getElementById('event-block-heading');

    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function localDatetimeToIso(local: string): string | null {
    const t = local.trim();

    if (!t) {
        return null;
    }

    const d = new Date(t);

    if (Number.isNaN(d.getTime())) {
        return null;
    }

    return d.toISOString();
}

async function handleSubmitEvent(): Promise<void> {
    eventFormError.value = null;

    const id = instructorId.value;

    if (!id) {
        eventFormError.value = 'Brak identyfikatora instruktora.';

        return;
    }

    const startIso = localDatetimeToIso(eventStartLocal.value);
    const endIso = localDatetimeToIso(eventEndLocal.value);

    if (!startIso || !endIso) {
        eventFormError.value = 'Podaj poczatek i koniec bloku.';

        return;
    }

    if (new Date(startIso).getTime() >= new Date(endIso).getTime()) {
        eventFormError.value = 'Koniec musi być pozniej niz poczatek.';

        return;
    }

    const type = eventType.value;

    if (type === 'DRIVE') {
        const vid = eventVehicleId.value.trim();

        if (!vid) {
            eventFormError.value =
                'Dla jazdy wybierz pojazd. Wymagany jest schoolId w adresie strony.';

            return;
        }
    }

    try {
        const cid = eventCourseId.value.trim();

        await createInstructorEvent({
            instructorId: id,
            type,
            startTime: startIso,
            endTime: endIso,
            vehicleId:
                type === 'DRIVE' ? eventVehicleId.value.trim() : undefined,
            ...(type === 'THEORY' && cid ? { courseId: cid } : {}),
        });

        addToast({
            title: 'Zapisano blok czasu',
            description: 'Blok zostal dodany do grafiku.',
            variant: 'success',
        });

        eventStartLocal.value = '';
        eventEndLocal.value = '';
        eventVehicleId.value = '';
        eventCourseId.value = '';

        await loadSchedule();
    } catch (err: unknown) {
        eventFormError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się utworzyć bloku.',
        );
    }
}

function handleRequestDelete(item: ScheduleLessonItem): void {
    pendingDeleteItem.value = item;
    deleteDialogOpen.value = true;
}

function handleDeleteDialogCancel(): void {
    deleteDialogOpen.value = false;
    pendingDeleteItem.value = null;
}

async function handleDeleteDialogConfirm(): Promise<void> {
    const item = pendingDeleteItem.value;

    if (!item) {
        return;
    }

    const removedId = item.id;

    try {
        await deleteInstructorEvent(removedId);

        addToast({
            title: 'Usunieto blok czasu',
            description: 'Blok zostal usuniety z harmonogramu.',
            variant: 'success',
        });

        items.value = items.value.filter((i) => i.id !== removedId);
        handleDeleteDialogCancel();
    } catch (err: unknown) {
        addToast({
            title: 'Nie udało się usunąć bloku',
            description: getApiFetchErrorMessage(
                err,
                'Spróbuj ponownie lub odśwież stronę.',
            ),
            variant: 'error',
        });
    }
}

const backHref = computed(() => {
    const id = instructorId.value;
    const sid = schoolId.value;

    if (!id) {
        return '/manager/instructors';
    }

    if (sid) {
        return {
            path: `/manager/instructors/${id}`,
            query: { schoolId: sid },
        };
    }

    return `/manager/instructors/${id}`;
});
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            title="Terminarz instruktora"
            description="Tygodniowy harmonogram jazd, teorii i blokad."
        >
            <template #actions>
                <UiButton
                    type="button"
                    variant="outline"
                    class="gap-2"
                    aria-label="Aktualny zakres tygodnia"
                >
                    <CalendarDays class="size-4" aria-hidden="true" />
                    {{ scheduleWeekLabel }}
                </UiButton>
                <UiButton
                    type="button"
                    class="shadow-primary-500/20 gap-2 shadow-lg"
                    @click="handleFocusEventForm"
                >
                    <Plus class="size-4" aria-hidden="true" />
                    Dodaj blok
                </UiButton>
            </template>
        </PageHeader>

        <ErrorState
            v-if="!instructorId"
            title="Nieprawidlowy instruktor"
            description="W adresie brakuje poprawnego identyfikatora instruktora."
        >
            <template #action>
                <UiButton as-child variant="outline" size="sm">
                    <NuxtLink to="/manager/instructors">
                        Wróć do instruktorów
                    </NuxtLink>
                </UiButton>
            </template>
        </ErrorState>

        <template v-else>
            <section
                class="border-border bg-card overflow-hidden rounded-xl border shadow-xs"
                aria-label="Kontekst terminarza instruktora"
            >
                <div
                    class="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                    <div class="flex min-w-0 gap-3">
                        <div
                            class="bg-primary-50 text-primary-600 flex size-11 shrink-0 items-center justify-center rounded-xl"
                            aria-hidden="true"
                        >
                            <Route class="size-5" />
                        </div>
                        <div class="min-w-0">
                            <h2 class="text-foreground text-lg font-semibold">
                                Harmonogram operacyjny
                            </h2>
                            <p
                                class="text-muted-foreground mt-1 text-sm leading-relaxed"
                            >
                                Kliknij wiersz bloku lub jazdy praktycznej, aby
                                otworzyć edycję. Bloki bez kursanta zmieniają
                                wolne sloty instruktora.
                            </p>
                            <p
                                v-if="!schoolId"
                                class="text-warning-800 mt-2 text-xs font-medium"
                            >
                                Dodaj <code>?schoolId=</code> w adresie, aby
                                wybrac pojazd dla bloku jazdy.
                            </p>
                        </div>
                    </div>

                    <div
                        class="grid overflow-hidden rounded-xl border sm:grid-cols-4"
                    >
                        <div class="border-border px-4 py-3 sm:border-r">
                            <p class="text-muted-foreground text-xs">Wpisy</p>
                            <p class="text-foreground mt-1 text-xl font-bold">
                                {{ scheduleItemsCount }}
                            </p>
                        </div>
                        <div class="border-border px-4 py-3 sm:border-r">
                            <p class="text-muted-foreground text-xs">Lekcje</p>
                            <p class="text-foreground mt-1 text-xl font-bold">
                                {{ lessonItemsCount }}
                            </p>
                        </div>
                        <div class="border-border px-4 py-3 sm:border-r">
                            <p class="text-muted-foreground text-xs">Bloki</p>
                            <p class="text-foreground mt-1 text-xl font-bold">
                                {{ blockItemsCount }}
                            </p>
                        </div>
                        <div class="px-4 py-3">
                            <p class="text-muted-foreground text-xs">
                                Najblizszy wpis
                            </p>
                            <p
                                class="text-foreground mt-1 text-sm font-bold whitespace-nowrap"
                            >
                                {{ nextScheduledItemLabel }}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                <section
                    class="border-border bg-card overflow-hidden rounded-xl border shadow-xs"
                    aria-labelledby="schedule-week-heading"
                >
                    <div
                        class="border-border flex flex-col gap-4 border-b p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
                    >
                        <div class="flex min-w-0 gap-3">
                            <div
                                class="bg-primary-50 text-primary-600 flex size-10 shrink-0 items-center justify-center rounded-xl"
                                aria-hidden="true"
                            >
                                <CalendarDays class="size-5" />
                            </div>
                            <div class="min-w-0">
                                <h2
                                    id="schedule-week-heading"
                                    class="text-foreground text-lg font-semibold"
                                >
                                    Terminarz
                                </h2>
                                <p
                                    class="text-muted-foreground mt-1 text-sm leading-relaxed"
                                >
                                    Tydzien od {{ formatWeekLabel(weekStart) }}.
                                </p>
                            </div>
                        </div>

                        <ActionGroup
                            label="Nawigacja tygodnia"
                            align="end"
                            density="compact"
                        >
                            <UiButton
                                type="button"
                                variant="outline"
                                size="sm"
                                class="gap-2"
                                aria-label="Poprzedni tydzien"
                                @click="handlePrevWeek"
                            >
                                <ArrowLeft class="size-4" aria-hidden="true" />
                                Poprzedni
                            </UiButton>
                            <UiButton
                                type="button"
                                variant="outline"
                                size="sm"
                                class="gap-2"
                                aria-label="Nastepny tydzien"
                                @click="handleNextWeek"
                            >
                                Nastepny
                                <ArrowRight class="size-4" aria-hidden="true" />
                            </UiButton>
                        </ActionGroup>
                    </div>

                    <div class="space-y-4 p-4 sm:p-5">
                        <FilterBar
                            title="Filtry zapytania API"
                            :result-label="scheduleResultLabel"
                            :is-loading="isScheduleLoading"
                        >
                            <StatusBadge
                                label="Instruktor"
                                tone="info"
                                subtle
                            />
                            <StatusBadge
                                :label="scheduleWeekLabel"
                                tone="neutral"
                                subtle
                            />
                            <StatusBadge
                                label="Sortuj: godzina"
                                tone="neutral"
                                subtle
                            />
                            <template #actions>
                                <UiButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    @click="loadSchedule"
                                >
                                    Odswiez
                                </UiButton>
                            </template>
                        </FilterBar>

                        <LoadingState
                            v-if="isScheduleLoading"
                            title="Wczytywanie terminarza"
                            description="Pobieram lekcje i bloki z wybranego tygodnia."
                        />
                        <ErrorState
                            v-else-if="scheduleError"
                            title="Nie udało się wczytać terminarza"
                            :description="scheduleError"
                            @retry="loadSchedule"
                        />
                        <ManagerScheduleLessonTable
                            v-else
                            :items="items"
                            event-edit-enabled
                            event-delete-enabled
                            event-status-change-enabled
                            :school-id="schoolId"
                            @request-delete="handleRequestDelete"
                            @status-changed="handleInstructorEventStatusChanged"
                        />
                    </div>
                </section>

                <FormSection
                    title="Dodaj blok czasu"
                    description="Blok bez kursanta rezerwuje czas instruktora dla teorii albo jazdy."
                >
                    <div id="event-block-heading" class="space-y-4">
                        <div class="space-y-2">
                            <UiLabel for="event-type">Typ</UiLabel>
                            <UiSelect v-model="eventType">
                                <UiSelectTrigger
                                    id="event-type"
                                    class="w-full"
                                    aria-label="Typ bloku: teoria lub jazda"
                                >
                                    <UiSelectValue placeholder="Typ bloku" />
                                </UiSelectTrigger>
                                <UiSelectContent>
                                    <UiSelectGroup>
                                        <UiSelectItem value="THEORY">
                                            Teoria
                                        </UiSelectItem>
                                        <UiSelectItem value="DRIVE">
                                            Jazda
                                        </UiSelectItem>
                                    </UiSelectGroup>
                                </UiSelectContent>
                            </UiSelect>
                        </div>

                        <div
                            v-if="eventType === 'THEORY' && schoolId"
                            class="space-y-2"
                        >
                            <UiLabel for="event-course">
                                Kurs opcjonalnie
                            </UiLabel>
                            <p
                                v-if="isCoursesLoading"
                                class="text-muted-foreground text-xs"
                                role="status"
                            >
                                Wczytywanie kursów...
                            </p>
                            <p
                                v-else-if="coursesError"
                                class="text-destructive text-xs"
                                role="alert"
                            >
                                {{ coursesError }}
                            </p>
                            <UiSelect
                                v-model="eventCourseId"
                                :disabled="isCoursesLoading || isEventSaving"
                            >
                                <UiSelectTrigger
                                    id="event-course"
                                    class="w-full"
                                    aria-label="Powiązanie bloku teorii z kursem"
                                >
                                    <UiSelectValue
                                        placeholder="Bez powiazania z kursem"
                                    />
                                </UiSelectTrigger>
                                <UiSelectContent>
                                    <UiSelectGroup>
                                        <UiSelectItem
                                            v-for="c in courses"
                                            :key="c.id"
                                            :value="c.id"
                                        >
                                            {{ c.name }} ({{ c.category }})
                                        </UiSelectItem>
                                    </UiSelectGroup>
                                </UiSelectContent>
                            </UiSelect>
                            <p class="text-muted-foreground text-xs">
                                Powiązanie z kursem nie dodaje kursantów na ten
                                blok.
                            </p>
                        </div>

                        <div v-if="eventType === 'DRIVE'" class="space-y-2">
                            <UiLabel for="event-vehicle">Pojazd</UiLabel>
                            <p
                                v-if="isVehiclesLoading"
                                class="text-muted-foreground text-xs"
                                role="status"
                            >
                                Wczytywanie pojazdów...
                            </p>
                            <p
                                v-else-if="vehiclesError"
                                class="text-destructive text-xs"
                                role="alert"
                            >
                                {{ vehiclesError }}
                            </p>
                            <UiSelect
                                v-model="eventVehicleId"
                                :disabled="
                                    !schoolId ||
                                    vehicles.length === 0 ||
                                    isVehiclesLoading
                                "
                            >
                                <UiSelectTrigger
                                    id="event-vehicle"
                                    class="w-full"
                                    aria-label="Pojazd dla bloku jazdy"
                                >
                                    <UiSelectValue
                                        placeholder="Wybierz pojazd"
                                    />
                                </UiSelectTrigger>
                                <UiSelectContent>
                                    <UiSelectGroup>
                                        <UiSelectItem
                                            v-for="v in vehicles"
                                            :key="v.id"
                                            :value="v.id"
                                        >
                                            {{ v.name }} ({{
                                                v.registrationNumber
                                            }})
                                        </UiSelectItem>
                                    </UiSelectGroup>
                                </UiSelectContent>
                            </UiSelect>
                        </div>

                        <div class="space-y-2">
                            <UiLabel for="event-start">Początek</UiLabel>
                            <UiDateTimePicker
                                id="event-start"
                                v-model="eventStartLocal"
                                placeholder="Data i godzina początku"
                                :aria-required="true"
                            />
                        </div>

                        <div class="space-y-2">
                            <UiLabel for="event-end">Koniec</UiLabel>
                            <UiDateTimePicker
                                id="event-end"
                                v-model="eventEndLocal"
                                placeholder="Data i godzina końca"
                                :aria-required="true"
                            />
                        </div>

                        <p
                            v-if="eventFormError"
                            class="text-destructive text-sm"
                            role="alert"
                        >
                            {{ eventFormError }}
                        </p>

                        <div
                            class="border-border bg-muted/30 grid gap-3 rounded-xl border p-3 text-xs sm:grid-cols-3 xl:grid-cols-1"
                        >
                            <div class="flex items-center gap-2">
                                <Clock
                                    class="text-primary size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                Walidacja czasu po stronie serwera
                            </div>
                            <div class="flex items-center gap-2">
                                <Layers3
                                    class="text-primary size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                Brak kursanta w nowym bloku
                            </div>
                            <div class="flex items-center gap-2">
                                <CalendarDays
                                    class="text-primary size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                Po zapisie odświeżam tydzien
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <ActionGroup label="Akcje bloku czasu" align="end">
                            <UiButton as-child variant="outline" type="button">
                                <NuxtLink :to="backHref">
                                    Szczegóły instruktora
                                </NuxtLink>
                            </UiButton>
                            <UiButton
                                type="button"
                                :disabled="isEventSaving"
                                :aria-busy="isEventSaving"
                                class="gap-2"
                                @click="handleSubmitEvent"
                            >
                                <Plus class="size-4" aria-hidden="true" />
                                {{
                                    isEventSaving
                                        ? 'Zapisywanie...'
                                        : 'Dodaj blok'
                                }}
                            </UiButton>
                        </ActionGroup>
                    </template>
                </FormSection>
            </div>
        </template>

        <ManagerInstructorEventDeleteDialog
            v-model:open="deleteDialogOpen"
            :time-range-label="pendingDeleteTimeLabel"
            :is-deleting="isEventDeleteLoading"
            @cancel="handleDeleteDialogCancel"
            @confirm="handleDeleteDialogConfirm"
        />
    </div>
</template>
