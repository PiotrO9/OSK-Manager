<script setup lang="ts">
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
    title: () => 'Lekcje i bloki',
    description: () =>
        'Terminarz lekcji instruktora oraz dodawanie bloków DRIVE/THEORY.',
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
/** Tylko THEORY — opcjonalne `courseId` w POST /events. */
const eventCourseId = ref('');
const eventFormError = ref<string | null>(null);

const deleteDialogOpen = ref(false);
const pendingDeleteItem = ref<ScheduleLessonItem | null>(null);

const range = computed(() => weekRangeFromMonday(weekStart.value));

const pendingDeleteTimeLabel = computed(() => {
    const item = pendingDeleteItem.value;

    if (!item) {
        return '';
    }

    return `${formatScheduleRangeLabel(item.startTime)} — ${formatScheduleRangeLabel(item.endTime)}`;
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

function formatWeekLabel(d: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
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
        eventFormError.value =
            'Podaj początek i koniec bloku (data i godzina).';

        return;
    }

    if (new Date(startIso).getTime() >= new Date(endIso).getTime()) {
        eventFormError.value = 'Koniec musi być później niż początek.';

        return;
    }

    const type = eventType.value;

    if (type === 'DRIVE') {
        const vid = eventVehicleId.value.trim();

        if (!vid) {
            eventFormError.value =
                'Dla jazdy wybierz pojazd (wymagany parametr schoolId w adresie strony i lista pojazdów OSK).';

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
            description: 'Blok został dodany do grafiku.',
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
            title: 'Usunięto blok czasu',
            description: 'Blok został usunięty z harmonogramu.',
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
    <div class="space-y-8">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Lekcje i bloki czasu
            </h1>
            <p class="text-muted-foreground text-sm">
                Terminarz lekcji w wybranym tygodniu. Możesz dodać blok
                DRIVE/THEORY bez kursanta (wpływa na wolne sloty). Kliknij
                wiersz bloku czasu lub jazdy praktycznej w tabeli, aby otworzyć
                edycję.
                <span
                    v-if="!schoolId"
                    class="text-amber-700 dark:text-amber-500"
                >
                    Dodaj
                    <code class="text-xs">?schoolId=</code>
                    w adresie, aby wybrać pojazd przy bloku jazdy.
                </span>
            </p>
        </div>

        <template v-if="!instructorId">
            <p class="text-destructive text-sm" role="alert">
                Nieprawidłowy identyfikator instruktora.
            </p>
        </template>

        <template v-else>
            <section class="space-y-3" aria-labelledby="schedule-week-heading">
                <h2
                    id="schedule-week-heading"
                    class="text-foreground text-lg font-semibold"
                >
                    Zaplanowane lekcje
                </h2>

                <div
                    class="flex flex-wrap items-center gap-2"
                    role="group"
                    aria-label="Nawigacja tygodnia"
                >
                    <UiButton
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label="Poprzedni tydzień"
                        @click="handlePrevWeek"
                    >
                        ← Poprzedni
                    </UiButton>
                    <UiButton
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label="Następny tydzień"
                        @click="handleNextWeek"
                    >
                        Następny →
                    </UiButton>
                    <span class="text-muted-foreground text-sm">
                        Tydzień od {{ formatWeekLabel(weekStart) }}
                    </span>
                </div>

                <p
                    v-if="isScheduleLoading"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Wczytywanie lekcji…
                </p>
                <p
                    v-else-if="scheduleError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ scheduleError }}
                </p>
                <ManagerScheduleLessonTable
                    v-else
                    :items="items"
                    event-edit-enabled
                    event-delete-enabled
                    :school-id="schoolId"
                    @request-delete="handleRequestDelete"
                />
            </section>

            <section
                class="border-border bg-card max-w-xl space-y-4 rounded-xl border p-6 shadow-sm"
                aria-labelledby="event-block-heading"
            >
                <h2
                    id="event-block-heading"
                    class="text-foreground text-lg font-semibold"
                >
                    Dodaj blok czasu (bez kursanta)
                </h2>
                <p class="text-muted-foreground text-xs">
                    Blok musi mieścić się w dostępności instruktora i nie
                    kolidować z lekcjami ani innymi blokami (walidacja po
                    stronie serwera).
                </p>

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
                                    Teoria (THEORY)
                                </UiSelectItem>
                                <UiSelectItem value="DRIVE">
                                    Jazda (DRIVE)
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                </div>

                <div
                    v-if="eventType === 'THEORY' && schoolId"
                    class="space-y-2"
                >
                    <UiLabel for="event-course">Kurs (opcjonalnie)</UiLabel>
                    <p
                        v-if="isCoursesLoading"
                        class="text-muted-foreground text-xs"
                        role="status"
                    >
                        Wczytywanie kursów…
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
                                placeholder="— Bez powiązania z kursem —"
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
                        Powiązanie z kursem nie dodaje kursantów na ten blok —
                        lista uczestników zaczyna się pusta; przypisania robisz
                        osobno (zgodnie z limitem miejsc).
                    </p>
                </div>

                <div v-if="eventType === 'DRIVE'" class="space-y-2">
                    <UiLabel for="event-vehicle">Pojazd</UiLabel>
                    <p
                        v-if="isVehiclesLoading"
                        class="text-muted-foreground text-xs"
                        role="status"
                    >
                        Wczytywanie pojazdów…
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
                            <UiSelectValue placeholder="— Wybierz pojazd —" />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem
                                    v-for="v in vehicles"
                                    :key="v.id"
                                    :value="v.id"
                                >
                                    {{ v.name }} ({{ v.registrationNumber }})
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
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
                </div>

                <p
                    v-if="eventFormError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ eventFormError }}
                </p>

                <UiButton
                    type="button"
                    :disabled="isEventSaving"
                    aria-busy="isEventSaving"
                    @click="handleSubmitEvent"
                >
                    {{ isEventSaving ? 'Zapisywanie…' : 'Dodaj blok' }}
                </UiButton>
            </section>
        </template>

        <ManagerInstructorEventDeleteDialog
            v-model:open="deleteDialogOpen"
            :time-range-label="pendingDeleteTimeLabel"
            :is-deleting="isEventDeleteLoading"
            @cancel="handleDeleteDialogCancel"
            @confirm="handleDeleteDialogConfirm"
        />

        <NuxtLink
            :to="backHref"
            class="text-primary focus-visible:ring-ring inline-flex rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Wróć do szczegółów instruktora"
        >
            Wróć do szczegółów instruktora
        </NuxtLink>
    </div>
</template>
