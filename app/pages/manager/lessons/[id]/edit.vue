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
import type { HeaderMetaItem, StatusTone } from '~/components/app/ui/types';
import type { Vehicle } from '~/types/vehicle';
import { isoInstantToDatetimeLocalString } from '~/utils/weeklyCalendarDates';

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

const FORM_ID = 'manager-lesson-edit-form';

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
    return isoInstantToDatetimeLocalString(iso);
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

const lessonStatusLabelMap: Record<string, string> = {
    SCHEDULED: 'Zaplanowana',
    COMPLETED: 'Zakonczona',
    CANCELLED: 'Anulowana',
    CANCELED: 'Anulowana',
};

const lessonStatusToneMap: Record<string, StatusTone> = {
    SCHEDULED: 'info',
    COMPLETED: 'success',
    CANCELLED: 'danger',
    CANCELED: 'danger',
};

const lessonStatusLabel = computed((): string => {
    const status = loadedLesson.value?.status.trim() ?? '';

    if (!status) {
        return '-';
    }

    return lessonStatusLabelMap[status] ?? status;
});

const lessonStatusTone = computed(
    (): StatusTone =>
        lessonStatusToneMap[loadedLesson.value?.status.trim() ?? ''] ??
        'neutral',
);

function formatDateRangeLabel(startIso?: string, endIso?: string): string {
    const start = startIso ? new Date(startIso) : null;
    const end = endIso ? new Date(endIso) : null;

    if (
        !start ||
        !end ||
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return 'Termin lekcji';
    }

    const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: 'long',
    });
    const timeFormatter = new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${dateFormatter.format(start)}, ${timeFormatter.format(start)}-${timeFormatter.format(end)}`;
}

const lessonDateLabel = computed(() =>
    formatDateRangeLabel(
        loadedLesson.value?.startTime,
        loadedLesson.value?.endTime,
    ),
);

const lessonHeaderMeta = computed<HeaderMetaItem[]>(() => {
    const lesson = loadedLesson.value;

    if (!lesson) {
        return [];
    }

    return [
        {
            label: 'Kursant',
            value:
                studentDisplayName.value ??
                `${lesson.studentId.slice(0, 8)}...`,
            tone: 'neutral',
        },
        {
            label: 'Status',
            value: lessonStatusLabel.value,
            tone: lessonStatusTone.value,
        },
    ];
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
    <div class="space-y-6">
        <ManagerLessonEditHeader
            :meta="lessonHeaderMeta"
            :lesson-date-label="lessonDateLabel"
            :form-id="FORM_ID"
            :can-save="Boolean(loadedLesson) && isFormDirty"
            :is-saving="isSaving"
        />

        <LoadingState
            v-if="isFetchLoading && !loadedLesson"
            title="Wczytywanie lekcji"
            description="Pobieramy dane potrzebne do edycji jazdy."
        />

        <EmptyState
            v-else-if="notFound"
            title="Nie znaleziono lekcji"
            description="Lekcja nie istnieje albo nie jest dostepna w aktualnym kontekscie."
        >
            <template #action>
                <UiButton as-child variant="outline">
                    <NuxtLink :to="scheduleBackHref"
                        >Wroc do harmonogramu</NuxtLink
                    >
                </UiButton>
            </template>
        </EmptyState>

        <ErrorState
            v-else-if="loadError"
            title="Nie udalo sie wczytac lekcji"
            :description="loadError"
            @retry="loadLesson"
        />

        <template v-else-if="loadedLesson">
            <FormSection
                title="Edytuj jazde"
                description="Formularz podzielony na logiczne sekcje, z zachowaniem aktualnej walidacji i flow."
            >
                <form
                    :id="FORM_ID"
                    class="grid gap-4 lg:grid-cols-2"
                    @submit.prevent="handleSubmit"
                >
                    <div class="space-y-2">
                        <UiLabel for="lesson-student">Kursant</UiLabel>
                        <UiInput
                            id="lesson-student"
                            :model-value="
                                studentDisplayName ??
                                `${loadedLesson.studentId.slice(0, 8)}...`
                            "
                            disabled
                        />
                    </div>

                    <div class="space-y-2">
                        <UiLabel for="lesson-status">Status</UiLabel>
                        <div class="flex min-h-9 items-center">
                            <StatusBadge
                                :label="lessonStatusLabel"
                                :tone="lessonStatusTone"
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
                            Wczytywanie instruktorow...
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
                            :disabled="instructorsForSelect.length === 0"
                        >
                            <UiSelectTrigger
                                id="lesson-instructor"
                                class="bg-background h-10 w-full rounded-xl"
                                :aria-label="`Instruktor: ${instructorSelectLabel}`"
                            >
                                <UiSelectValue
                                    placeholder="- Wybierz instruktora -"
                                />
                            </UiSelectTrigger>
                            <UiSelectContent>
                                <UiSelectGroup>
                                    <UiSelectItem
                                        v-for="ins in instructorsForSelect"
                                        :key="ins.id"
                                        :value="ins.id"
                                    >
                                        {{ formatInstructorDisplayName(ins) }}
                                    </UiSelectItem>
                                </UiSelectGroup>
                            </UiSelectContent>
                        </UiSelect>
                    </div>

                    <div class="space-y-2">
                        <UiLabel for="lesson-vehicle">Pojazd</UiLabel>
                        <p
                            v-if="isVehiclesLoading"
                            class="text-muted-foreground text-xs"
                            role="status"
                        >
                            Wczytywanie pojazdow...
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
                            :disabled="vehiclesForSelect.length === 0"
                        >
                            <UiSelectTrigger
                                id="lesson-vehicle"
                                class="bg-background h-10 w-full rounded-xl"
                                aria-label="Pojazd dla jazdy praktycznej"
                            >
                                <UiSelectValue
                                    placeholder="- Wybierz pojazd -"
                                />
                            </UiSelectTrigger>
                            <UiSelectContent>
                                <UiSelectGroup>
                                    <UiSelectItem
                                        v-for="v in vehiclesForSelect"
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

                    <fieldset class="space-y-3 lg:col-span-2">
                        <legend class="text-foreground text-sm font-semibold">
                            Termin
                        </legend>
                        <div class="grid gap-4 md:grid-cols-2">
                            <div class="space-y-2">
                                <UiLabel for="lesson-start">Poczatek</UiLabel>
                                <UiDateTimePicker
                                    id="lesson-start"
                                    v-model="formStartLocal"
                                    placeholder="Data i godzina poczatku"
                                    :aria-required="true"
                                    trigger-class="h-10 rounded-xl bg-background"
                                />
                            </div>
                            <div class="space-y-2">
                                <UiLabel for="lesson-end">Koniec</UiLabel>
                                <UiDateTimePicker
                                    id="lesson-end"
                                    v-model="formEndLocal"
                                    placeholder="Data i godzina konca"
                                    :aria-required="true"
                                    trigger-class="h-10 rounded-xl bg-background"
                                />
                            </div>
                        </div>
                    </fieldset>

                    <p
                        v-if="!schoolId"
                        class="text-warning-800 bg-warning-50 border-warning-200 rounded-xl border px-3 py-2 text-sm lg:col-span-2"
                        role="status"
                    >
                        Dodaj <code class="text-xs">?schoolId=</code> w adresie,
                        aby wybrac pojazd i instruktora z list OSK.
                    </p>

                    <p
                        v-if="formError"
                        class="text-destructive text-sm lg:col-span-2"
                        role="alert"
                    >
                        {{ formError }}
                    </p>
                </form>

                <template #footer>
                    <ManagerLessonEditActions
                        :form-id="FORM_ID"
                        :can-save="isFormDirty"
                        :is-saving="isSaving"
                        @cancel="handleCancel"
                    />
                </template>
            </FormSection>
        </template>
    </div>
</template>
