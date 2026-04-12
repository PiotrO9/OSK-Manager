<script setup lang="ts">
import ManagerEventStudentPickerDialog from '~/components/manager/events/ManagerEventStudentPickerDialog.vue';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import {
    formatInstructorDisplayName,
    normalizeInstructorDetail,
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
const { removeStudentsFromEvent, isAssigning, isRemoving } = useEventApi();

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

const instructorNameFallback = ref<string | null>(null);

const studentsForLabels = ref<StudentListItem[]>([]);
const studentsLabelsError = ref<string | null>(null);
const isStudentsLabelsLoading = ref(false);

const isStudentPickerOpen = ref(false);
const theoryStudentsError = ref<string | null>(null);

const isSaving = computed(() => isUpdateLoading.value);

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
    formStartLocal.value = isoToDatetimeLocal(ev.startTime);
    formEndLocal.value = isoToDatetimeLocal(ev.endTime);
    formVehicleId.value = ev.vehicleId?.trim() ? ev.vehicleId : '';
    formInstructorId.value = ev.instructorId.trim();
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
        start: isoToDatetimeLocal(ev.startTime),
        end: isoToDatetimeLocal(ev.endTime),
        vehicle: (ev.vehicleId ?? '').trim(),
        capacity: normalizeCapacityForCompare(ev.capacity ?? null),
        instructorId: ev.instructorId.trim(),
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

const isFormDirty = computed((): boolean => {
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

    const fb = instructorNameFallback.value?.trim();

    if (fb) {
        return fb;
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

const excludeStudentUserIdsForPicker = computed((): string[] => {
    if (!studentAttendanceKnown.value) {
        return [];
    }

    return assignedStudentUserIds.value;
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

async function loadInstructorNameFallback(instructorId: string): Promise<void> {
    const id = instructorId.trim();

    if (!id) {
        instructorNameFallback.value = null;

        return;
    }

    try {
        const raw = await $fetch<unknown>(
            resolveBffEndpoint(`/api/instructors/${encodeURIComponent(id)}`),
            {
                method: 'GET',
                credentials: 'include',
            },
        );

        const data = unwrapApiSuccessData<unknown>(raw);
        const d = normalizeInstructorDetail(data);

        instructorNameFallback.value = d?.name?.trim() || null;
    } catch {
        instructorNameFallback.value = null;
    }
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
        void loadInstructorNameFallback(ev.instructorId);
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

/** Limit GET /students: 1–100 (BFF); bazuje na limicie miejsc wydarzenia. */
function resolveStudentsListLimit(): number {
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
        const page = await fetchStudentsPage({
            schoolId: sid,
            page: 1,
            limit: resolveStudentsListLimit(),
        });

        studentsForLabels.value = page.items;
    } catch (err: unknown) {
        studentsLabelsError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się wczytać kursantów (etykiety).',
        );
    } finally {
        isStudentsLabelsLoading.value = false;
    }
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
        void loadVehicles();
        void loadInstructors();
    },
    { immediate: true },
);

watch(
    () => [
        schoolId.value,
        capacityForStudentPicker.value,
        assignedStudentUserIds.value.join('|'),
    ],
    () => {
        void loadStudentsForLabels();
    },
    { immediate: true },
);

watch(
    () => [formInstructorId.value, instructors.value] as const,
    () => {
        const id = formInstructorId.value.trim();
        const hit = instructors.value.find((i) => i.id === id);

        if (hit) {
            instructorNameFallback.value = null;
        }
    },
    { deep: true },
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

function resolveStudentLabel(userId: string): string {
    const uid = userId.trim();

    if (!uid) {
        return '—';
    }

    const hit = studentsForLabels.value.find((s) => s.userId === uid);

    if (hit) {
        return formatStudentDisplayName(hit);
    }

    return uid;
}

async function handleRemoveStudent(userId: string): Promise<void> {
    theoryStudentsError.value = null;

    const uid = userId.trim();
    const eid = eventId.value.trim();

    if (!uid || !eid) {
        return;
    }

    try {
        await removeStudentsFromEvent(eid, [uid]);

        addToast({
            title: 'Kursant usunięty',
            description: 'Przypisanie do wydarzenia zostało cofnięte.',
            variant: 'success',
        });

        await loadEvent();
    } catch (err: unknown) {
        theoryStudentsError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się usunąć kursanta z wydarzenia.',
        );
    }
}

function handleOpenStudentPicker(): void {
    theoryStudentsError.value = null;
    isStudentPickerOpen.value = true;
}

async function handleStudentsAssigned(): Promise<void> {
    theoryStudentsError.value = null;

    await loadEvent();
}

async function handleSubmit(): Promise<void> {
    formError.value = null;

    if (!isFormDirty.value) {
        return;
    }

    const id = eventId.value;

    if (!id) {
        formError.value = 'Brak identyfikatora wydarzenia.';

        return;
    }

    const startIso = localDatetimeToIso(formStartLocal.value);
    const endIso = localDatetimeToIso(formEndLocal.value);

    if (!startIso || !endIso) {
        formError.value = 'Podaj początek i koniec bloku (data i godzina).';

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

    try {
        await updateInstructorEvent(id, payload);

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

const selectFieldClass =
    'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50';
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
            <div
                class="bg-muted/40 space-y-1 rounded-lg border px-3 py-2 text-sm"
                role="status"
            >
                <p>
                    <span class="text-muted-foreground">ID wydarzenia:</span>
                    <span class="font-mono">{{ loadedEvent.id }}</span>
                </p>
                <p>
                    <span class="text-muted-foreground">Instruktor:</span>
                    <span class="font-medium">{{ instructorSelectLabel }}</span>
                    <span
                        v-if="formInstructorId.trim()"
                        class="text-muted-foreground ml-1 font-mono text-xs"
                        >({{ formInstructorId.trim() }})</span
                    >
                </p>
            </div>

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
                        <select
                            id="edit-event-instructor"
                            v-model="formInstructorId"
                            :disabled="
                                !schoolId || isInstructorsLoading || isSaving
                            "
                            :class="selectFieldClass"
                            aria-label="Instruktor prowadzący blok"
                        >
                            <option
                                v-if="
                                    formInstructorId.trim() &&
                                    !instructors.some(
                                        (i) => i.id === formInstructorId.trim(),
                                    )
                                "
                                :value="formInstructorId.trim()"
                            >
                                {{ instructorSelectLabel }}
                            </option>
                            <option
                                v-for="i in instructors"
                                :key="i.id"
                                :value="i.id"
                            >
                                {{ formatInstructorDisplayName(i) }}
                            </option>
                        </select>
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

                    <div class="space-y-2">
                        <UiLabel for="edit-event-type">Typ</UiLabel>
                        <select
                            id="edit-event-type"
                            v-model="formType"
                            disabled
                            :class="selectFieldClass"
                            aria-label="Typ bloku (nie można zmienić): teoria lub jazda"
                            title="Typu zajęć nie można zmienić po utworzeniu wydarzenia"
                        >
                            <option value="THEORY">Teoria (THEORY)</option>
                            <option value="DRIVE">Jazda (DRIVE)</option>
                        </select>
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
                        <select
                            id="edit-event-vehicle"
                            v-model="formVehicleId"
                            :disabled="
                                !schoolId ||
                                vehicles.length === 0 ||
                                isVehiclesLoading ||
                                isSaving
                            "
                            :class="selectFieldClass"
                            aria-label="Pojazd dla bloku jazdy"
                        >
                            <option value="">— Wybierz pojazd —</option>
                            <option
                                v-for="v in vehicles"
                                :key="v.id"
                                :value="v.id"
                            >
                                {{ v.name }} ({{ v.registrationNumber }})
                            </option>
                        </select>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <div class="space-y-2">
                            <UiLabel for="edit-event-start">Początek</UiLabel>
                            <input
                                id="edit-event-start"
                                v-model="formStartLocal"
                                type="datetime-local"
                                :disabled="isSaving"
                                :class="selectFieldClass"
                                aria-required="true"
                            />
                        </div>
                        <div class="space-y-2">
                            <UiLabel for="edit-event-end">Koniec</UiLabel>
                            <input
                                id="edit-event-end"
                                v-model="formEndLocal"
                                type="datetime-local"
                                :disabled="isSaving"
                                :class="selectFieldClass"
                                aria-required="true"
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <UiLabel for="edit-event-capacity">
                            Limit miejsc (opcjonalnie)
                        </UiLabel>
                        <input
                            id="edit-event-capacity"
                            v-model="formCapacityInput"
                            type="number"
                            min="0"
                            step="1"
                            inputmode="numeric"
                            :disabled="isSaving"
                            :class="selectFieldClass"
                            placeholder="Puste = bez limitu"
                            aria-describedby="edit-event-capacity-hint"
                        />
                        <p
                            id="edit-event-capacity-hint"
                            class="text-muted-foreground text-xs"
                        >
                            Puste pole = brak limitu. Wpisz liczbę całkowitą ≥
                            0.
                        </p>
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
                    Przypisz lub usuń kursantów z tego bloku. Wymagany jest
                    <code class="text-xs">?schoolId=</code>
                    w adresie strony.
                </p>
                <p
                    v-if="!studentAttendanceKnown"
                    class="text-muted-foreground border-border space-y-2 rounded-md border border-dashed px-3 py-2 text-sm"
                    role="status"
                >
                    <span class="text-foreground block font-medium">
                        To nie jest błąd listy kursantów z sieci
                    </span>
                    <span class="block">
                        Odpowiedź
                        <span class="font-mono text-xs">GET /api/events/…</span>
                        nie zawiera pól z przypisaniami (np.
                        <span class="font-mono text-xs">studentUserIds</span>
                        ), więc nie pokazujemy „kto jest już zapisany na ten
                        blok” ani przycisków „Usuń”.
                    </span>
                    <span class="block">
                        Osobne żądanie
                        <span class="font-mono text-xs">/api/students</span>
                        zwraca katalog kursantów OSK do dopisywania — to
                        <span class="text-foreground font-medium">
                            nie jest
                        </span>
                        ta sama informacja co zapisani na to wydarzenie.
                        Dopisując, duplikaty pomija serwer.
                    </span>
                </p>
                <p
                    v-else-if="isStudentsLabelsLoading"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Wczytywanie nazw kursantów…
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
                        assignedStudentUserIds.length > 0
                    "
                    class="space-y-2"
                    role="list"
                >
                    <li
                        v-for="uid in assignedStudentUserIds"
                        :key="uid"
                        class="border-input flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
                    >
                        <span class="min-w-0 text-sm font-medium">{{
                            resolveStudentLabel(uid)
                        }}</span>
                        <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            :disabled="isRemoving"
                            :aria-label="`Usuń kursanta ${resolveStudentLabel(uid)} z wydarzenia`"
                            @click="handleRemoveStudent(uid)"
                        >
                            {{ isRemoving ? 'Usuwanie…' : 'Usuń' }}
                        </UiButton>
                    </li>
                </ul>
                <p
                    v-else-if="studentAttendanceKnown"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Brak przypisanych kursantów.
                </p>
                <p
                    v-if="theoryStudentsError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ theoryStudentsError }}
                </p>
                <div>
                    <UiButton
                        type="button"
                        :disabled="!schoolId || isAssigning"
                        aria-label="Otwórz wybór kursantów do dopisania"
                        @click="handleOpenStudentPicker"
                    >
                        Dopisz kursantów…
                    </UiButton>
                </div>
            </section>

            <ManagerEventStudentPickerDialog
                v-model:open="isStudentPickerOpen"
                :event-id="eventId"
                :capacity="capacityForStudentPicker"
                :school-id="schoolId"
                :exclude-student-user-ids="excludeStudentUserIdsForPicker"
                @assigned="handleStudentsAssigned"
            />
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
