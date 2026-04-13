<script setup lang="ts">
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import {
    getApiErrorStatusCode,
    unwrapApiSuccessData,
} from '~/utils/apiEnvelope';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructor';
import type { ManagerLessonDetail } from '~/types/managerLesson';
import {
    formatStudentDisplayName,
    normalizeStudentDetail,
    type StudentDetail,
} from '~/types/student';
import type { Vehicle } from '~/types/vehicle';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const { session } = useAuthSession();
const { addToast } = useAppToast();
const { fetchLesson, updateLesson, isFetchLoading, isUpdateLoading } =
    useManagerLessonsApi();
const { fetchList: fetchVehiclesList, fetchVehicleById } = useVehiclesApi();
const { fetchList: fetchInstructorsList } = useInstructorsApi();

function getLessonIdFromRoute(): string {
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

const lessonId = computed(getLessonIdFromRoute);

/** Jak na `/manager/schedule`: query lub domyślna OSK z sesji — żeby listy instruktorów/pojazdów się wczytały. */
const schoolId = computed((): string => {
    const q = readSchoolIdFromQuery();

    if (q) {
        return q;
    }

    const def = session.value?.defaultOskId;

    return typeof def === 'string' ? def.trim() : '';
});

usePageMeta({
    title: () => 'Edycja jazdy praktycznej',
    description: () => 'Zmień termin, pojazd lub instruktora lekcji.',
});

const loadedLesson = ref<ManagerLessonDetail | null>(null);
const loadError = ref<string | null>(null);
const notFound = ref(false);

const formStartLocal = ref('');
const formEndLocal = ref('');
const formVehicleId = ref('');
const formInstructorId = ref('');
const formError = ref<string | null>(null);

const vehicles = ref<Vehicle[]>([]);
const vehiclesError = ref<string | null>(null);
const isVehiclesLoading = ref(false);

const instructors = ref<InstructorListItem[]>([]);
const instructorsError = ref<string | null>(null);
const isInstructorsLoading = ref(false);

const instructorNameFallback = ref<string | null>(null);
/** Gdy pojazd z lekcji nie ma na liście OSK — etykieta z GET /vehicles/:id. */
const vehicleDisplayFallback = ref<Vehicle | null>(null);
const studentDisplayName = ref<string | null>(null);

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

function applyPrefill(lesson: ManagerLessonDetail): void {
    formStartLocal.value = isoToDatetimeLocal(lesson.startTime);
    formEndLocal.value = isoToDatetimeLocal(lesson.endTime);
    formVehicleId.value = lesson.vehicleId?.trim() ? lesson.vehicleId : '';
    formInstructorId.value = lesson.instructorId.trim();
    formError.value = null;
}

const baselineSnapshot = computed((): Record<string, string> | null => {
    const lesson = loadedLesson.value;

    if (!lesson) {
        return null;
    }

    return {
        start: isoToDatetimeLocal(lesson.startTime),
        end: isoToDatetimeLocal(lesson.endTime),
        vehicle: (lesson.vehicleId ?? '').trim(),
        instructorId: lesson.instructorId.trim(),
    };
});

const currentSnapshot = computed((): Record<string, string> | null => {
    return {
        start: formStartLocal.value,
        end: formEndLocal.value,
        vehicle: formVehicleId.value.trim(),
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

const scheduleBackHref = computed(() => {
    const sid = schoolId.value.trim();

    if (sid) {
        return {
            path: '/manager/schedule',
            query: { schoolId: sid },
        };
    }

    return '/manager/schedule';
});

async function loadVehicleDisplayFallback(
    vehicleId: string | null | undefined,
): Promise<void> {
    vehicleDisplayFallback.value = null;

    const id =
        typeof vehicleId === 'string'
            ? vehicleId.trim()
            : vehicleId != null
              ? String(vehicleId).trim()
              : '';

    if (!id) {
        return;
    }

    try {
        vehicleDisplayFallback.value = await fetchVehicleById(id);
    } catch {
        vehicleDisplayFallback.value = null;
    }
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
        const normalized = parseInstructorListItemFromApi(data);

        if (normalized) {
            instructorNameFallback.value =
                formatInstructorDisplayName(normalized);

            return;
        }
    } catch {
        instructorNameFallback.value = null;
    }
}

function parseInstructorListItemFromApi(
    raw: unknown,
): InstructorListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id.trim() : '';

    if (!id) {
        return null;
    }

    const firstName =
        typeof o.firstName === 'string'
            ? o.firstName.trim()
            : typeof o.first_name === 'string'
              ? o.first_name.trim()
              : '';
    const lastName =
        typeof o.lastName === 'string'
            ? o.lastName.trim()
            : typeof o.last_name === 'string'
              ? o.last_name.trim()
              : '';

    const email =
        typeof o.email === 'string'
            ? o.email.trim()
            : typeof o.Email === 'string'
              ? o.Email.trim()
              : '';

    return { id, firstName, lastName, email };
}

async function loadStudentDisplayName(
    lesson: ManagerLessonDetail,
): Promise<void> {
    studentDisplayName.value = null;

    const nested = lesson.student;

    if (nested) {
        const n = `${nested.firstName} ${nested.lastName}`.trim();

        studentDisplayName.value = n.length > 0 ? n : null;

        return;
    }

    const sid = schoolId.value.trim();
    const uid = lesson.studentId.trim();

    if (!sid || !uid) {
        studentDisplayName.value = null;

        return;
    }

    try {
        const qs = new URLSearchParams({ schoolId: sid });
        const raw = await $fetch<unknown>(
            resolveBffEndpoint(
                `/api/students/${encodeURIComponent(uid)}?${qs.toString()}`,
            ),
            {
                method: 'GET',
                credentials: 'include',
            },
        );

        const data = unwrapApiSuccessData<unknown>(raw);
        const detail: StudentDetail | null = normalizeStudentDetail(data);

        if (detail) {
            studentDisplayName.value = formatStudentDisplayName(detail);

            return;
        }
    } catch {
        /* fallback poniżej */
    }

    studentDisplayName.value = uid.length > 12 ? `${uid.slice(0, 8)}…` : uid;
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

async function loadLesson(): Promise<void> {
    const id = lessonId.value;

    if (!id) {
        loadedLesson.value = null;
        loadError.value = 'Brak identyfikatora lekcji.';
        notFound.value = false;

        return;
    }

    const seq = ++loadSeq;

    loadError.value = null;
    notFound.value = false;
    loadedLesson.value = null;

    try {
        const lesson = await fetchLesson(id);

        if (seq !== loadSeq) {
            return;
        }

        loadedLesson.value = lesson;
        instructorNameFallback.value = null;
        vehicleDisplayFallback.value = null;
        applyPrefill(lesson);

        if (!lesson.lessonInstructor && lesson.instructorId.trim()) {
            void loadInstructorNameFallback(lesson.instructorId);
        }

        if (!lesson.lessonVehicle && lesson.vehicleId?.trim()) {
            void loadVehicleDisplayFallback(lesson.vehicleId);
        }

        void loadStudentDisplayName(lesson);
    } catch (err: unknown) {
        if (seq !== loadSeq) {
            return;
        }

        loadedLesson.value = null;

        const status = getApiErrorStatusCode(err);

        if (status === 404) {
            notFound.value = true;
            loadError.value = null;
        } else {
            notFound.value = false;
            loadError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać lekcji.',
            );
        }
    }
}

watch(
    lessonId,
    () => {
        void loadLesson();
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

watch(
    () => [formVehicleId.value, vehicles.value] as const,
    () => {
        const id = formVehicleId.value.trim();
        const hit = vehicles.value.find((v) => v.id === id);

        if (hit) {
            vehicleDisplayFallback.value = null;
        }
    },
    { deep: true },
);

const instructorsForSelect = computed((): InstructorListItem[] => {
    const list = instructors.value;
    const id = formInstructorId.value.trim();

    if (!id) {
        return list;
    }

    if (list.some((i) => i.id === id)) {
        return list;
    }

    const embedded = loadedLesson.value?.lessonInstructor;
    const embeddedMatch = embedded && embedded.id === id ? embedded : null;
    const fb = instructorNameFallback.value?.trim();
    const synthetic: InstructorListItem = embeddedMatch ?? {
        id,
        firstName: fb ? fb : 'Aktualny',
        lastName: '',
        email: '',
    };

    return [synthetic, ...list];
});

const vehiclesForSelect = computed((): Vehicle[] => {
    const list = vehicles.value;
    const id = formVehicleId.value.trim();

    if (!id) {
        return list;
    }

    if (list.some((v) => v.id === id)) {
        return list;
    }

    const embedded = loadedLesson.value?.lessonVehicle;
    const embeddedMatch = embedded && embedded.id === id ? embedded : null;
    const fb = vehicleDisplayFallback.value;
    const synthetic: Vehicle = embeddedMatch ?? {
        id,
        name: fb?.name ?? 'Aktualny pojazd',
        registrationNumber: fb?.registrationNumber ?? '—',
        status: fb?.status ?? 'ACTIVE',
        isDefault: fb?.isDefault ?? false,
        inspectionDate: fb?.inspectionDate ?? null,
        insuranceDate: fb?.insuranceDate ?? null,
        modelYear: fb?.modelYear ?? null,
        mileageKm: fb?.mileageKm ?? null,
    };

    return [synthetic, ...list];
});

const instructorSelectLabel = computed((): string => {
    const id = formInstructorId.value.trim();

    if (!id) {
        return '—';
    }

    const fromList = instructorsForSelect.value.find((i) => i.id === id);

    if (fromList) {
        return formatInstructorDisplayName(fromList);
    }

    const fb = instructorNameFallback.value?.trim();

    if (fb) {
        return fb;
    }

    return id;
});

function handleCancel(): void {
    void navigateTo(scheduleBackHref.value);
}

async function handleSubmit(): Promise<void> {
    formError.value = null;

    if (!isFormDirty.value) {
        return;
    }

    const id = lessonId.value;

    if (!id) {
        formError.value = 'Brak identyfikatora lekcji.';

        return;
    }

    const startIso = localDatetimeToIso(formStartLocal.value);
    const endIso = localDatetimeToIso(formEndLocal.value);

    if (!startIso || !endIso) {
        formError.value = 'Podaj początek i koniec lekcji (data i godzina).';

        return;
    }

    if (new Date(startIso).getTime() >= new Date(endIso).getTime()) {
        formError.value = 'Koniec musi być później niż początek.';

        return;
    }

    const vid = formVehicleId.value.trim();

    if (!vid) {
        formError.value = 'Wybierz pojazd.';

        return;
    }

    const iid = formInstructorId.value.trim();

    if (!iid) {
        formError.value = 'Wybierz instruktora.';

        return;
    }

    const base = baselineSnapshot.value;

    if (!base) {
        formError.value = 'Brak danych wyjściowych lekcji.';

        return;
    }

    const payload: {
        startTime?: string;
        endTime?: string;
        vehicleId?: string;
        instructorId?: string;
    } = {};

    if (base.start !== formStartLocal.value) {
        payload.startTime = startIso;
    }

    if (base.end !== formEndLocal.value) {
        payload.endTime = endIso;
    }

    if (base.vehicle !== vid) {
        payload.vehicleId = vid;
    }

    if (base.instructorId !== iid) {
        payload.instructorId = iid;
    }

    if (Object.keys(payload).length === 0) {
        return;
    }

    try {
        const updated = await updateLesson(id, payload);

        loadedLesson.value = updated;
        instructorNameFallback.value = null;
        vehicleDisplayFallback.value = null;
        applyPrefill(updated);

        if (!updated.lessonInstructor && updated.instructorId.trim()) {
            void loadInstructorNameFallback(updated.instructorId);
        }

        if (!updated.lessonVehicle && updated.vehicleId?.trim()) {
            void loadVehicleDisplayFallback(updated.vehicleId);
        }

        void loadStudentDisplayName(updated);

        addToast({
            title: 'Zapisano lekcję',
            description: 'Zmiany zostały zapisane.',
            variant: 'success',
        });
    } catch (err: unknown) {
        formError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się zapisać lekcji.',
        );
    }
}
</script>

<template>
    <div class="space-y-8">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Edycja jazdy praktycznej
            </h1>
            <p class="text-muted-foreground text-sm">
                Zmień termin, pojazd lub instruktora. Kursant i kurs są
                przypisane do rezerwacji — nie można ich tu zmienić.
            </p>
        </div>

        <p
            v-if="isFetchLoading && !loadedLesson"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Wczytywanie lekcji…
        </p>

        <p v-else-if="notFound" class="text-destructive text-sm" role="alert">
            Nie znaleziono lekcji lub brak połączenia z API (tryb demo).
        </p>

        <p v-else-if="loadError" class="text-destructive text-sm" role="alert">
            {{ loadError }}
        </p>

        <template v-else-if="loadedLesson">
            <div
                class="border-border bg-card max-w-xl space-y-6 rounded-xl border p-6 shadow-sm"
            >
                <dl class="grid gap-2 text-sm">
                    <div
                        class="grid gap-1 sm:grid-cols-[8rem_1fr] sm:items-baseline"
                    >
                        <dt class="text-muted-foreground font-medium">
                            Kursant
                        </dt>
                        <dd class="text-foreground font-medium">
                            {{
                                studentDisplayName ??
                                loadedLesson.studentId.slice(0, 8) + '…'
                            }}
                        </dd>
                    </div>
                    <div
                        class="grid gap-1 sm:grid-cols-[8rem_1fr] sm:items-baseline"
                    >
                        <dt class="text-muted-foreground font-medium">
                            Status
                        </dt>
                        <dd>{{ loadedLesson.status }}</dd>
                    </div>
                </dl>

                <div class="grid gap-4 sm:grid-cols-2">
                    <div class="space-y-2">
                        <UiLabel for="lesson-start">Początek</UiLabel>
                        <input
                            id="lesson-start"
                            v-model="formStartLocal"
                            type="datetime-local"
                            class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            aria-required="true"
                        />
                    </div>
                    <div class="space-y-2">
                        <UiLabel for="lesson-end">Koniec</UiLabel>
                        <input
                            id="lesson-end"
                            v-model="formEndLocal"
                            type="datetime-local"
                            class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            aria-required="true"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <UiLabel for="lesson-instructor">Instruktor</UiLabel>
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
                        id="lesson-instructor"
                        v-model="formInstructorId"
                        :disabled="instructorsForSelect.length === 0"
                        class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
                        :aria-label="`Instruktor: ${instructorSelectLabel}`"
                    >
                        <option value="">— Wybierz instruktora —</option>
                        <option
                            v-for="ins in instructorsForSelect"
                            :key="ins.id"
                            :value="ins.id"
                        >
                            {{ formatInstructorDisplayName(ins) }}
                        </option>
                    </select>
                </div>

                <div class="space-y-2">
                    <UiLabel for="lesson-vehicle">Pojazd</UiLabel>
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
                        id="lesson-vehicle"
                        v-model="formVehicleId"
                        :disabled="vehiclesForSelect.length === 0"
                        class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
                        aria-label="Pojazd dla jazdy praktycznej"
                    >
                        <option value="">— Wybierz pojazd —</option>
                        <option
                            v-for="v in vehiclesForSelect"
                            :key="v.id"
                            :value="v.id"
                        >
                            {{ v.name }} ({{ v.registrationNumber }})
                        </option>
                    </select>
                </div>

                <p
                    v-if="!schoolId"
                    class="text-xs text-amber-700 dark:text-amber-500"
                    role="status"
                >
                    Dodaj
                    <code class="text-xs">?schoolId=</code>
                    w adresie, aby wybrać pojazd i instruktora z list OSK.
                </p>

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
                        :disabled="!isFormDirty || isSaving"
                        :aria-busy="isSaving"
                        @click="handleSubmit"
                    >
                        {{ isSaving ? 'Zapisywanie…' : 'Zapisz zmiany' }}
                    </UiButton>
                    <UiButton
                        type="button"
                        variant="outline"
                        @click="handleCancel"
                    >
                        Anuluj
                    </UiButton>
                </div>
            </div>
        </template>

        <NuxtLink
            :to="scheduleBackHref"
            class="text-primary focus-visible:ring-ring inline-flex rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
            Wróć do terminarza
        </NuxtLink>
    </div>
</template>
