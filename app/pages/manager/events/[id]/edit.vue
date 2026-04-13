<script setup lang="ts">
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructor';
import type {
    InstructorEvent,
    PatchInstructorEventPayload,
} from '~/types/instructorEvent';
import type { StudentListItem } from '~/types/student';
import { formatStudentDisplayName } from '~/types/student';
import type { Vehicle } from '~/types/vehicle';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const { addToast } = useAppToast();
const {
    fetchEventById,
    updateInstructorEvent,
    isFetchLoading,
    isUpdateLoading,
} = useInstructorEventsApi();
const { fetchList: fetchVehiclesList } = useVehiclesApi();
const { fetchList: fetchInstructorsList } = useInstructorsApi();
const { fetchList: fetchStudentsPage } = useStudentsApi();
const { fetchById: fetchCourseById } = useCoursesApi();
const { replaceStudentsOnEvent, isReplacing } = useEventApi();

function getEventIdFromRoute(): string {
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

const eventId = computed(getEventIdFromRoute);
const schoolId = computed(readSchoolIdFromQuery);

usePageMeta({
    title: () => 'Edycja wydarzenia',
    description: () => 'Zmień dane bloku czasu instruktora.',
});

const loadedEvent = ref<InstructorEvent | null>(null);
const loadError = ref<string | null>(null);
const notFound = ref(false);

const formType = ref<'THEORY' | 'DRIVE'>('THEORY');
const formStartLocal = ref('');
const formEndLocal = ref('');
const formVehicleId = ref('');
const formInstructorId = ref('');
/** `type="number"` + v-model może dać `number` lub `string`. */
const formCapacityInput = ref<string | number>('');
const formError = ref<string | null>(null);

const vehicles = ref<Vehicle[]>([]);
const vehiclesError = ref<string | null>(null);
const isVehiclesLoading = ref(false);

const instructors = ref<InstructorListItem[]>([]);
const instructorsError = ref<string | null>(null);
const isInstructorsLoading = ref(false);

const studentsForLabels = ref<StudentListItem[]>([]);
const studentsLabelsError = ref<string | null>(null);
const isStudentsLabelsLoading = ref(false);

const theoryStudentsError = ref<string | null>(null);

/** Etykieta kursu przy `courseId` (teoria) — do podpowiedzi w UI. */
const linkedCourseLabel = ref<string | null>(null);

/** Stan zapisany na serwerze (posortowany zestaw UUID) — do porównania z draftem. */
const theoryStudentsBaseline = ref<string[]>([]);
/** Zaznaczenia przed zapisem formularza (checkboxy). */
const draftTheoryStudentUserIds = ref<string[]>([]);

const isSaving = computed(() => isUpdateLoading.value || isReplacing.value);

let loadSeq = 0;

function isoToDatetimeLocal(iso: string): string {
    const t = iso.trim();

    if (t.length >= 16) {
        return t.slice(0, 16);
    }

    const d = new Date(t);

    if (Number.isNaN(d.getTime())) {
        return '';
    }

    return d.toISOString().slice(0, 16);
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

function normalizeCapacityForCompare(cap: number | null | undefined): string {
    if (cap === null || cap === undefined) {
        return '';
    }

    if (!Number.isFinite(cap)) {
        return '';
    }

    return String(Math.trunc(cap));
}

function applyPrefill(ev: InstructorEvent): void {
    formType.value = ev.type === 'DRIVE' ? 'DRIVE' : 'THEORY';
    formStartLocal.value = isoToDatetimeLocal(ev.startTime ?? '');
    formEndLocal.value = isoToDatetimeLocal(ev.endTime ?? '');
    formVehicleId.value = ev.vehicleId?.trim() ? ev.vehicleId : '';
    formInstructorId.value = (ev.instructorId ?? '').trim();
    formCapacityInput.value =
        ev.capacity !== undefined && ev.capacity !== null ? ev.capacity : '';
    formError.value = null;
}

function parseCapacity(raw: unknown): number | null | false {
    if (raw === null || raw === undefined) {
        return null;
    }

    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) {
            return null;
        }

        if (raw < 0) {
            return false;
        }

        return Math.trunc(raw);
    }

    const t = String(raw).trim();

    if (t === '') {
        return null;
    }

    const n = Number.parseInt(t, 10);

    if (!Number.isFinite(n) || n < 0) {
        return false;
    }

    return n;
}

const baselineSnapshot = computed((): Record<string, string> | null => {
    const ev = loadedEvent.value;

    if (!ev) {
        return null;
    }

    return {
        type: ev.type === 'DRIVE' ? 'DRIVE' : 'THEORY',
        start: isoToDatetimeLocal(ev.startTime ?? ''),
        end: isoToDatetimeLocal(ev.endTime ?? ''),
        vehicle: (ev.vehicleId ?? '').trim(),
        capacity: normalizeCapacityForCompare(ev.capacity ?? null),
        instructorId: (ev.instructorId ?? '').trim(),
    };
});

const currentSnapshot = computed((): Record<string, string> | null => {
    const capParsed = parseCapacity(formCapacityInput.value);
    const cap = capParsed === false ? null : capParsed;

    return {
        type: formType.value,
        start: formStartLocal.value,
        end: formEndLocal.value,
        vehicle: formType.value === 'DRIVE' ? formVehicleId.value.trim() : '',
        capacity: normalizeCapacityForCompare(cap),
        instructorId: formInstructorId.value.trim(),
    };
});

function sortedStudentIds(ids: string[]): string[] {
    return [...ids]
        .map((s) => s.trim())
        .filter(Boolean)
        .sort();
}

/**
 * Uczestnictwo w **tym** evencie jest w `studentUserIds` (GET wydarzenia / …/students),
 * nie w polu `isActive` z GET /students (to status kursanta w OSK).
 * Te same osoby mogą być identyfikowane jako `users.id` albo `student_profiles.id` —
 * dopasowujemy wiersz katalogu po obu.
 */
function findCatalogRowForAssignedId(
    catalog: StudentListItem[],
    assignedId: string,
): StudentListItem | undefined {
    const t = assignedId.trim();

    if (!t) {
        return undefined;
    }

    return catalog.find(
        (c) => t === c.userId.trim() || (!!c.id?.trim() && t === c.id.trim()),
    );
}

function normalizeTheoryParticipantIdsAgainstCatalog(): void {
    const cat = studentsForLabels.value;

    if (cat.length === 0) {
        return;
    }

    function toCanonical(raw: string): string {
        const t = raw.trim();

        if (!t) {
            return t;
        }

        const hit = findCatalogRowForAssignedId(cat, t);

        return hit ? hit.userId.trim() : t;
    }

    draftTheoryStudentUserIds.value = [
        ...new Set(
            draftTheoryStudentUserIds.value.map(toCanonical).filter(Boolean),
        ),
    ];

    theoryStudentsBaseline.value = sortedStudentIds(
        theoryStudentsBaseline.value.map(toCanonical).filter(Boolean),
    );
}

function draftIdBelongsToStudentRow(
    row: StudentListItem,
    assignedId: string,
): boolean {
    const t = assignedId.trim();

    if (!t) {
        return false;
    }

    if (t === row.userId.trim()) {
        return true;
    }

    const pid = row.id?.trim();

    return Boolean(pid && t === pid);
}

function isTheoryRowChecked(s: StudentListItem): boolean {
    for (const raw of draftTheoryStudentUserIds.value) {
        if (draftIdBelongsToStudentRow(s, raw)) {
            return true;
        }
    }

    return false;
}

function getCanonicalParticipantUserIdForRow(s: StudentListItem): string {
    return s.userId.trim() || s.id.trim();
}

const isFormFieldsDirty = computed((): boolean => {
    const a = baselineSnapshot.value;
    const b = currentSnapshot.value;

    if (!a || !b) {
        return false;
    }

    return JSON.stringify(a) !== JSON.stringify(b);
});

const instructorSelectLabel = computed((): string => {
    const id = formInstructorId.value.trim();

    if (!id) {
        return '—';
    }

    const fromList = instructors.value.find((i) => i.id === id);

    if (fromList) {
        return formatInstructorDisplayName(fromList);
    }

    const embedded = loadedEvent.value?.eventInstructor;

    if (embedded && embedded.id === id) {
        return formatInstructorDisplayName(embedded);
    }

    return id;
});

const assignedStudentUserIds = computed((): string[] => {
    const ids = loadedEvent.value?.studentUserIds;

    return Array.isArray(ids) ? [...ids] : [];
});

const studentAttendanceKnown = computed(
    (): boolean => loadedEvent.value?.studentAttendanceKnown ?? false,
);

/** Zmiana składu grupy (checkboxy) — nie zależy od `studentAttendanceKnown` (przycisk Zapisz musi reagować na draft vs baseline). */
const isTheoryStudentsDirty = computed((): boolean => {
    const ev = loadedEvent.value;

    if (
        !ev ||
        String(ev.type ?? '')
            .trim()
            .toUpperCase() !== 'THEORY'
    ) {
        return false;
    }

    return (
        JSON.stringify(sortedStudentIds(draftTheoryStudentUserIds.value)) !==
        JSON.stringify(theoryStudentsBaseline.value)
    );
});

const isFormDirty = computed(
    (): boolean => isFormFieldsDirty.value || isTheoryStudentsDirty.value,
);

const capacityForStudentPicker = computed((): number | null => {
    const parsed = parseCapacity(formCapacityInput.value);

    if (parsed === false) {
        return loadedEvent.value?.capacity ?? null;
    }

    if (parsed !== null) {
        return parsed;
    }

    return loadedEvent.value?.capacity ?? null;
});

function getErrorStatusCode(err: unknown): number | undefined {
    if (typeof err !== 'object' || err === null) {
        return undefined;
    }

    if (!('statusCode' in err)) {
        return undefined;
    }

    const c = (err as { statusCode: unknown }).statusCode;

    return typeof c === 'number' ? c : undefined;
}

async function loadEvent(): Promise<void> {
    const id = eventId.value;

    if (!id) {
        loadedEvent.value = null;
        loadError.value = null;
        notFound.value = false;

        return;
    }

    const seq = ++loadSeq;

    loadError.value = null;
    notFound.value = false;
    loadedEvent.value = null;

    try {
        const ev = await fetchEventById(id);

        if (seq !== loadSeq) {
            return;
        }

        loadedEvent.value = ev;
        applyPrefill(ev);
        await syncTheoryStudentCatalogAfterEventLoad();
    } catch (err: unknown) {
        if (seq !== loadSeq) {
            return;
        }

        if (getErrorStatusCode(err) === 404) {
            notFound.value = true;

            return;
        }

        loadError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się wczytać wydarzenia.',
        );
    }
}

function isLoadedEventDrive(): boolean {
    const ev = loadedEvent.value;

    if (!ev) {
        return false;
    }

    return String(ev.type).trim().toUpperCase() === 'DRIVE';
}

/** Tylko jazda (DRIVE) — teoria nie potrzebuje listy pojazdów. */
async function loadVehicles(): Promise<void> {
    vehiclesError.value = null;
    vehicles.value = [];

    if (!isLoadedEventDrive()) {
        return;
    }

    const sid = schoolId.value.trim();

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

async function loadInstructors(): Promise<void> {
    const sid = schoolId.value;

    instructorsError.value = null;
    instructors.value = [];

    if (!sid) {
        return;
    }

    isInstructorsLoading.value = true;

    try {
        instructors.value = await fetchInstructorsList(sid);
    } catch (err: unknown) {
        instructorsError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się pobrać listy instruktorów.',
        );
    } finally {
        isInstructorsLoading.value = false;
    }
}

/**
 * Limit GET /students: 1–100 (BFF).
 * Dla teorii — pełniejszy katalog pod checkboxy (max strony z BFF).
 */
function resolveStudentsListLimit(): number {
    const ev = loadedEvent.value;
    const isTheory =
        ev &&
        String(ev.type ?? '')
            .trim()
            .toUpperCase() === 'THEORY';

    if (isTheory) {
        return 100;
    }

    const cap = capacityForStudentPicker.value;
    const assignedCount = assignedStudentUserIds.value.length;

    if (cap === null || cap === undefined) {
        return Math.min(100, Math.max(assignedCount, 1));
    }

    const capFloored = Math.max(0, Math.trunc(cap));
    const fromCapacity = Math.max(1, capFloored);

    return Math.min(100, Math.max(fromCapacity, assignedCount));
}

async function loadStudentsForLabels(): Promise<void> {
    const sid = schoolId.value;

    studentsLabelsError.value = null;
    studentsForLabels.value = [];

    if (!sid) {
        return;
    }

    isStudentsLabelsLoading.value = true;

    try {
        const ev = loadedEvent.value;
        const isTheory =
            ev &&
            String(ev.type ?? '')
                .trim()
                .toUpperCase() === 'THEORY';
        const courseId =
            isTheory && ev?.courseId?.trim() ? ev.courseId.trim() : undefined;

        const page = await fetchStudentsPage({
            schoolId: sid,
            page: 1,
            limit: resolveStudentsListLimit(),
            ...(courseId ? { courseId } : {}),
        });

        studentsForLabels.value = page.items;
        normalizeTheoryParticipantIdsAgainstCatalog();
    } catch (err: unknown) {
        studentsLabelsError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się wczytać kursantów (etykiety).',
        );
    } finally {
        isStudentsLabelsLoading.value = false;
    }
}

/** GET /api/students — katalog OSK (osobne od GET /api/events/…/students). */
async function syncTheoryStudentCatalogAfterEventLoad(): Promise<void> {
    const sid = schoolId.value.trim();
    const ev = loadedEvent.value;

    studentsLabelsError.value = null;

    if (!sid || !ev) {
        studentsForLabels.value = [];

        return;
    }

    if (
        String(ev.type ?? '')
            .trim()
            .toUpperCase() !== 'THEORY'
    ) {
        studentsForLabels.value = [];

        return;
    }

    await loadStudentsForLabels();
}

watch(
    eventId,
    () => {
        void loadEvent();
    },
    { immediate: true },
);

watch(
    schoolId,
    () => {
        void loadInstructors();
    },
    { immediate: true },
);

watch(
    [schoolId, loadedEvent],
    () => {
        void loadVehicles();
    },
    { immediate: true },
);

/** Ponowne pobranie katalogu, gdy użytkownik zmieni `?schoolId=` przy już wczytanym evencie. */
watch(
    () => schoolId.value.trim(),
    (sid, prevSid) => {
        if (sid === prevSid) {
            return;
        }

        const ev = loadedEvent.value;

        if (!ev) {
            return;
        }

        if (
            String(ev.type ?? '')
                .trim()
                .toUpperCase() !== 'THEORY'
        ) {
            return;
        }

        if (!sid) {
            studentsForLabels.value = [];

            return;
        }

        void loadStudentsForLabels();
    },
);

watch(
    () =>
        [
            loadedEvent.value?.courseId?.trim() ?? '',
            schoolId.value.trim(),
        ] as const,
    async ([cid, sid]) => {
        linkedCourseLabel.value = null;

        if (!cid || !sid) {
            return;
        }

        try {
            const d = await fetchCourseById(cid);

            linkedCourseLabel.value = d.name.trim() || null;
        } catch {
            linkedCourseLabel.value = null;
        }
    },
    { immediate: true },
);

watch(
    () => loadedEvent.value,
    (ev) => {
        if (!ev) {
            theoryStudentsBaseline.value = [];
            draftTheoryStudentUserIds.value = [];

            return;
        }

        const ids = ev.studentUserIds;
        const arr = Array.isArray(ids)
            ? ids.map((x) => String(x).trim()).filter(Boolean)
            : [];

        theoryStudentsBaseline.value = sortedStudentIds(arr);
        draftTheoryStudentUserIds.value = [...arr];
    },
    { immediate: true },
);

const scheduleBackHref = computed(() => {
    const ins =
        formInstructorId.value.trim() ||
        loadedEvent.value?.instructorId?.trim();
    const sid = schoolId.value;

    if (!ins) {
        return '/manager/instructors';
    }

    if (sid) {
        return {
            path: `/manager/instructors/${ins}/schedule`,
            query: { schoolId: sid },
        };
    }

    return `/manager/instructors/${ins}/schedule`;
});

function handleCancel(): void {
    void navigateTo(scheduleBackHref.value);
}

/** Kursanci z katalogu OSK + ewentualnie zapisani spoza pierwszej strony listy. */
const theoryCheckboxStudents = computed((): StudentListItem[] => {
    const active = studentsForLabels.value.filter((s) => s.isActive);
    const seen = new Set<string>();

    for (const s of active) {
        seen.add(s.userId.trim());

        if (s.id?.trim()) {
            seen.add(s.id.trim());
        }
    }

    const extra: StudentListItem[] = [];

    for (const raw of draftTheoryStudentUserIds.value) {
        const uid = raw.trim();

        if (!uid || seen.has(uid)) {
            continue;
        }

        const hit = findCatalogRowForAssignedId(studentsForLabels.value, uid);

        if (hit) {
            continue;
        }

        seen.add(uid);
        extra.push({
            id: uid,
            userId: uid,
            firstName: '',
            lastName: '(poza pierwszą stroną katalogu)',
            email: '',
            phone: null,
            pkkNumber: null,
            isActive: true,
            createdAt: '',
        });
    }

    return [...active, ...extra];
});

function handleToggleTheoryStudent(s: StudentListItem, next: boolean): void {
    theoryStudentsError.value = null;

    const cap = capacityForStudentPicker.value;

    if (
        next &&
        cap !== null &&
        !isTheoryRowChecked(s) &&
        draftTheoryStudentUserIds.value.length >= Math.trunc(cap)
    ) {
        theoryStudentsError.value =
            'Osiągnięto limit miejsc — odznacz kogoś lub zwiększ limit w danych bloku.';

        return;
    }

    if (next) {
        if (isTheoryRowChecked(s)) {
            return;
        }

        const canonical = getCanonicalParticipantUserIdForRow(s);

        if (!canonical) {
            return;
        }

        draftTheoryStudentUserIds.value = [
            ...draftTheoryStudentUserIds.value,
            canonical,
        ];

        return;
    }

    draftTheoryStudentUserIds.value = draftTheoryStudentUserIds.value.filter(
        (id) => !draftIdBelongsToStudentRow(s, id),
    );
}

async function handleSubmit(): Promise<void> {
    formError.value = null;
    theoryStudentsError.value = null;

    if (!isFormDirty.value) {
        return;
    }

    const id = eventId.value.trim();

    if (!id) {
        formError.value = 'Brak identyfikatora wydarzenia.';

        return;
    }

    const fieldsDirty = isFormFieldsDirty.value;
    const participantsDirty = isTheoryStudentsDirty.value;

    if (participantsDirty) {
        if (!studentAttendanceKnown.value) {
            formError.value =
                'Brak danych o zapisanych kursantach — nie można zapisać listy.';

            return;
        }

        const cap = capacityForStudentPicker.value;

        if (
            cap !== null &&
            draftTheoryStudentUserIds.value.length > Math.trunc(cap)
        ) {
            formError.value =
                'Liczba zaznaczonych kursantów przekracza limit miejsc bloku.';

            return;
        }
    }

    try {
        if (fieldsDirty) {
            const startIso = localDatetimeToIso(formStartLocal.value);
            const endIso = localDatetimeToIso(formEndLocal.value);

            if (!startIso || !endIso) {
                formError.value =
                    'Podaj początek i koniec bloku (data i godzina).';

                return;
            }

            if (new Date(startIso).getTime() >= new Date(endIso).getTime()) {
                formError.value = 'Koniec musi być później niż początek.';

                return;
            }

            const type = formType.value;

            if (type === 'DRIVE') {
                const vid = formVehicleId.value.trim();

                if (!vid) {
                    formError.value =
                        'Dla jazdy wybierz pojazd (parametr ?schoolId= w adresie strony i lista pojazdów OSK).';

                    return;
                }
            }

            const ins = formInstructorId.value.trim();

            if (!ins) {
                formError.value = 'Wybierz instruktora.';

                return;
            }

            const capParsed = parseCapacity(formCapacityInput.value);

            if (capParsed === false) {
                formError.value =
                    'Limit miejsc musi być liczbą całkowitą ≥ 0 lub puste (bez limitu).';

                return;
            }

            const payload: PatchInstructorEventPayload = {
                instructorId: ins,
                type,
                startTime: startIso,
                endTime: endIso,
                vehicleId: type === 'DRIVE' ? formVehicleId.value.trim() : null,
                capacity: capParsed,
            };

            await updateInstructorEvent(id, payload);
        }

        if (participantsDirty) {
            await replaceStudentsOnEvent(
                id,
                sortedStudentIds(draftTheoryStudentUserIds.value),
            );
        }

        addToast({
            title: 'Zapisano zmiany',
            description: 'Wydarzenie zostało zaktualizowane.',
            variant: 'success',
        });

        await navigateTo(scheduleBackHref.value);
    } catch (err: unknown) {
        formError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się zapisać zmian.',
        );
    }
}
</script>

<template>
    <div class="space-y-8">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Edycja wydarzenia
            </h1>
            <p class="text-muted-foreground text-sm">
                Zmień czas trwania, pojazd (jazda), instruktora lub limit miejsc
                (typ bloku jest ustalony). Walidacja kolizji po stronie serwera.
                <span
                    v-if="!schoolId"
                    class="text-amber-700 dark:text-amber-500"
                >
                    Dodaj
                    <code class="text-xs">?schoolId=</code>
                    w adresie, aby wybrać pojazd przy jazdzie, zmienić
                    instruktora i zarządzać kursantami (teoria).
                </span>
            </p>
        </div>

        <template v-if="!eventId">
            <p class="text-destructive text-sm" role="alert">
                Nieprawidłowy identyfikator wydarzenia.
            </p>
        </template>

        <template v-else-if="isFetchLoading && !loadedEvent && !notFound">
            <p class="text-muted-foreground text-sm" role="status">
                Wczytywanie wydarzenia…
            </p>
        </template>

        <template v-else-if="notFound">
            <p class="text-destructive text-sm" role="alert">
                Wydarzenie nie zostało znalezione (404).
            </p>
            <NuxtLink
                to="/manager/instructors"
                class="text-primary focus-visible:ring-ring inline-flex rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            >
                Wróć do listy instruktorów
            </NuxtLink>
        </template>

        <template v-else-if="loadError">
            <p class="text-destructive text-sm" role="alert">
                {{ loadError }}
            </p>
            <UiButton
                type="button"
                variant="outline"
                class="mt-2"
                @click="loadEvent"
            >
                Spróbuj ponownie
            </UiButton>
        </template>

        <template v-else-if="loadedEvent">
            <section
                class="border-border bg-card max-w-xl space-y-4 rounded-xl border p-6 shadow-sm"
                aria-labelledby="event-edit-heading"
            >
                <h2
                    id="event-edit-heading"
                    class="text-foreground text-lg font-semibold"
                >
                    Dane bloku
                </h2>

                <form
                    class="space-y-4"
                    aria-label="Formularz edycji wydarzenia"
                    :aria-busy="isSaving"
                    @submit.prevent="handleSubmit"
                >
                    <div class="space-y-2">
                        <UiLabel for="edit-event-instructor">
                            Instruktor
                        </UiLabel>
                        <p
                            v-if="isInstructorsLoading"
                            class="text-muted-foreground text-xs"
                            role="status"
                        >
                            Wczytywanie instruktorów…
                        </p>
                        <p
                            v-else-if="instructorsError"
                            class="text-destructive text-xs"
                            role="alert"
                        >
                            {{ instructorsError }}
                        </p>
                        <UiSelect
                            v-model="formInstructorId"
                            :disabled="
                                !schoolId || isInstructorsLoading || isSaving
                            "
                        >
                            <UiSelectTrigger
                                id="edit-event-instructor"
                                class="w-full"
                                aria-label="Instruktor prowadzący blok"
                            >
                                <UiSelectValue
                                    placeholder="Wybierz instruktora"
                                />
                            </UiSelectTrigger>
                            <UiSelectContent>
                                <UiSelectGroup>
                                    <UiSelectItem
                                        v-if="
                                            formInstructorId.trim() &&
                                            !instructors.some(
                                                (inst) =>
                                                    inst.id ===
                                                    formInstructorId.trim(),
                                            )
                                        "
                                        :value="formInstructorId.trim()"
                                    >
                                        {{ instructorSelectLabel }}
                                    </UiSelectItem>
                                    <UiSelectItem
                                        v-for="i in instructors"
                                        :key="i.id"
                                        :value="i.id"
                                    >
                                        {{ formatInstructorDisplayName(i) }}
                                    </UiSelectItem>
                                </UiSelectGroup>
                            </UiSelectContent>
                        </UiSelect>
                        <p
                            v-if="!schoolId"
                            class="text-muted-foreground text-xs"
                            role="status"
                        >
                            Dodaj
                            <code class="text-xs">?schoolId=</code>
                            w adresie, aby zmienić instruktora z listy OSK.
                        </p>
                    </div>

                    <div v-if="formType === 'DRIVE'" class="space-y-2">
                        <UiLabel for="edit-event-vehicle">Pojazd</UiLabel>
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
                            v-model="formVehicleId"
                            :disabled="
                                !schoolId ||
                                vehicles.length === 0 ||
                                isVehiclesLoading ||
                                isSaving
                            "
                        >
                            <UiSelectTrigger
                                id="edit-event-vehicle"
                                class="w-full"
                                aria-label="Pojazd dla bloku jazdy"
                            >
                                <UiSelectValue
                                    placeholder="— Wybierz pojazd —"
                                />
                            </UiSelectTrigger>
                            <UiSelectContent>
                                <UiSelectGroup>
                                    <UiSelectItem value="">
                                        — Wybierz pojazd —
                                    </UiSelectItem>
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

                    <div class="grid gap-4 sm:grid-cols-2">
                        <div class="space-y-2">
                            <UiLabel for="edit-event-start">Początek</UiLabel>
                            <UiDateTimePicker
                                id="edit-event-start"
                                v-model="formStartLocal"
                                :disabled="isSaving"
                                placeholder="Data i godzina początku"
                                :aria-required="true"
                            />
                        </div>
                        <div class="space-y-2">
                            <UiLabel for="edit-event-end">Koniec</UiLabel>
                            <UiDateTimePicker
                                id="edit-event-end"
                                v-model="formEndLocal"
                                :disabled="isSaving"
                                placeholder="Data i godzina końca"
                                :aria-required="true"
                            />
                        </div>
                    </div>

                    <p
                        v-if="formError"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{ formError }}
                    </p>

                    <div class="flex flex-wrap gap-2">
                        <UiButton
                            type="button"
                            variant="outline"
                            :disabled="isSaving"
                            @click="handleCancel"
                        >
                            Anuluj
                        </UiButton>
                        <UiButton
                            type="submit"
                            :disabled="isSaving || !isFormDirty"
                        >
                            {{ isSaving ? 'Zapisywanie…' : 'Zapisz zmiany' }}
                        </UiButton>
                    </div>
                </form>
            </section>

            <section
                v-if="formType === 'THEORY'"
                class="border-border bg-card max-w-xl space-y-4 rounded-xl border p-6 shadow-sm"
                aria-labelledby="event-theory-students-heading"
            >
                <h2
                    id="event-theory-students-heading"
                    class="text-foreground text-lg font-semibold"
                >
                    Kursanci (teoria)
                </h2>
                <p class="text-muted-foreground text-sm">
                    Zaznacz aktywnych kursantów z listy OSK — zapiszesz zmiany
                    przyciskiem „Zapisz zmiany” w sekcji „Dane bloku”. Wymagany
                    jest
                    <code class="text-xs">?schoolId=</code>
                    w adresie strony.
                </p>
                <p
                    v-if="loadedEvent?.courseId?.trim()"
                    class="text-muted-foreground border-border rounded-md border border-dashed px-3 py-2 text-sm"
                    role="status"
                >
                    <span class="text-foreground font-medium">Kurs:</span>
                    {{ linkedCourseLabel ?? loadedEvent.courseId }}
                    — lista dotyczy uczestników tego kursu (nie całej szkoły).
                </p>
                <p
                    v-if="!studentAttendanceKnown"
                    class="text-muted-foreground border-border space-y-2 rounded-md border border-dashed px-3 py-2 text-sm"
                    role="status"
                >
                    <span class="text-foreground block font-medium">
                        Brak listy zapisanych na ten blok
                    </span>
                    <span class="block">
                        Nie udało się ustalić aktualnych przypisań (np.
                        <span class="font-mono text-xs"
                            >GET …/events/…/students</span
                        >
                        ). Bez tego nie można edytować składu grupy.
                    </span>
                </p>
                <p
                    v-else-if="isStudentsLabelsLoading"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Wczytywanie kursantów…
                </p>
                <p
                    v-else-if="studentsLabelsError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ studentsLabelsError }}
                </p>
                <ul
                    v-else-if="
                        studentAttendanceKnown &&
                        theoryCheckboxStudents.length > 0
                    "
                    class="space-y-2"
                    role="list"
                    aria-label="Lista kursantów — zaznacz uczestników bloku"
                >
                    <li
                        v-for="s in theoryCheckboxStudents"
                        :key="s.userId || s.id"
                        class="border-input flex items-start gap-3 rounded-md border px-3 py-2"
                    >
                        <UiCheckbox
                            :id="`theory-student-${s.userId || s.id}`"
                            :checked="isTheoryRowChecked(s)"
                            :disabled="isSaving || !schoolId"
                            :aria-label="`Uczestnik bloku: ${formatStudentDisplayName(s)}`"
                            @update:checked="
                                handleToggleTheoryStudent(s, $event === true)
                            "
                        />
                        <UiLabel
                            :for="`theory-student-${s.userId || s.id}`"
                            class="text-foreground flex-1 cursor-pointer text-sm leading-snug font-normal peer-disabled:cursor-not-allowed"
                        >
                            {{ formatStudentDisplayName(s) }}
                        </UiLabel>
                    </li>
                </ul>
                <p
                    v-else-if="studentAttendanceKnown"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Brak aktywnych kursantów w katalogu OSK (pierwsza strona
                    listy).
                </p>
                <p
                    v-if="theoryStudentsError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ theoryStudentsError }}
                </p>
            </section>
        </template>

        <NuxtLink
            v-if="loadedEvent || notFound"
            :to="scheduleBackHref"
            class="text-primary focus-visible:ring-ring inline-flex rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Wróć do terminarza instruktora"
        >
            Wróć do terminarza instruktora
        </NuxtLink>
    </div>
</template>
