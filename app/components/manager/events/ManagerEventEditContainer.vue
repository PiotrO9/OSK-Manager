<script setup lang="ts">
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import {
    formatInstructorDisplayName,
    instructorHasCourseCategoryQualification,
    type InstructorListItem,
} from '~/types/instructor';
import type { CourseDetail } from '~/types/course';
import type {
    FreeWindow,
    InstructorEvent,
    PatchInstructorEventPayload,
    TheoryEventEligibleStudentRow,
    TheoryEventEligibleStudentsData,
} from '~/types/instructorEvent';
import type { StudentListItem } from '~/types/student';
import { formatStudentDisplayName } from '~/types/student';
import { theoryEligibleRowToStudentListItem } from '~/utils/theoryEventEligibleStudents';
import {
    isSlotWithinFreeWindows,
    slotsToFreeWindows,
} from '~/utils/freeWindows';
import {
    getAllowedHoursForDate,
    getAllowedHoursForEnd,
    getAllowedMinutesForDateHour,
    getAllowedMinutesForEndHour,
    getLocalDateBoundsForCalendar,
    suggestDefaultEndLocal,
} from '~/utils/eventEditFreeWindowsPicker';
import {
    buildDatetimeLocal,
    isoDateStringToCalendarDate,
    isoInstantToDatetimeLocalString,
    parseDatetimeLocalParts,
} from '~/utils/weeklyCalendarDates';
import type { Vehicle } from '~/types/vehicle';

const route = useRoute();
const { addToast } = useAppToast();
const {
    fetchEventById,
    fetchTheoryEventEligibleStudents,
    updateInstructorEvent,
    deleteInstructorEvent,
    isFetchLoading,
    isUpdateLoading,
    isDeleteLoading,
} = useInstructorEventsApi();
const { fetchList: fetchVehiclesList } = useVehiclesApi();
const { fetchList: fetchInstructorsList } = useInstructorsApi();
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
/** Rozdzielone pola UI — synchronizowane z `formStartLocal` / `formEndLocal`. */
const formStartDate = ref('');
const formStartHour = ref(9);
const formStartMinute = ref(0);
const formEndDate = ref('');
const formEndHour = ref(9);
const formEndMinute = ref(0);

const FULL_HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);

const FULL_MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i);
const formVehicleId = ref('');
const formInstructorId = ref('');
const { fetchSlots: fetchInstructorSlots, isLoading: isSlotsLoading } =
    useInstructorSlotsApi(formInstructorId);
/** `type="number"` + v-model może dać `number` lub `string`. */
const formCapacityInput = ref<string | number>('');
const formError = ref<string | null>(null);

const vehicles = ref<Vehicle[]>([]);
const vehiclesError = ref<string | null>(null);
const isVehiclesLoading = ref(false);

const instructors = ref<InstructorListItem[]>([]);
const instructorsError = ref<string | null>(null);
const isInstructorsLoading = ref(false);

const theoryStudentsError = ref<string | null>(null);
const theoryEligibleData = ref<TheoryEventEligibleStudentsData | null>(null);
const theoryEligibleError = ref<string | null>(null);
const isTheoryEligibleLoading = ref(false);
/** Event THEORY bez `courseId` — brak endpointu eligible-students. */
const theoryEligibleNoCourse = ref(false);

/** Etykieta kursu przy `courseId` (teoria) — do podpowiedzi w UI. */
const linkedCourseLabel = ref<string | null>(null);
const linkedCourse = ref<CourseDetail | null>(null);

const qualifiedInstructorsForEvent = computed((): InstructorListItem[] => {
    if (formType.value !== 'THEORY' || !loadedEvent.value?.courseId?.trim()) {
        return instructors.value;
    }

    const course = linkedCourse.value;

    if (!course) {
        return [];
    }

    const categoryCode = course.courseType?.code?.trim() || course.category;

    return instructors.value.filter((instructor) =>
        instructorHasCourseCategoryQualification(instructor, categoryCode),
    );
});

/** Stan zapisany na serwerze (posortowany zestaw UUID) — do porównania z draftem. */
const theoryStudentsBaseline = ref<string[]>([]);
/** Zaznaczenia przed zapisem formularza (checkboxy). */
const draftTheoryStudentUserIds = ref<string[]>([]);

/** Wolne okna czasu instruktora (GET includeSlots lub przeliczone z GET …/availability/slots). */
const freeWindows = ref<FreeWindow[]>([]);
/** true gdy `freeWindows` jest pustą tablicą — brak dostępności w danym dniu. */
const freeWindowsUnavailable = ref(false);
/** Po `loadEvent` — pomiń jeden refresh slotów (unikaj podwójnego GET). */
let skipSlotsRefreshAfterLoad = false;

const isSaving = computed(() => isUpdateLoading.value || isReplacing.value);

let loadSeq = 0;

let eligibleDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let eligibleSeq = 0;

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

const ISO_DATE_LOCAL_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidLocalDateString(s: string): boolean {
    return ISO_DATE_LOCAL_RE.test(s.trim());
}

function hydrateStartSplitFromLocal(): void {
    const v = formStartLocal.value.trim();
    const p = parseDatetimeLocalParts(v);

    if (!p) {
        formStartDate.value = '';
        formStartHour.value = 9;
        formStartMinute.value = 0;

        return;
    }

    formStartDate.value = `${p.date.year}-${String(p.date.month).padStart(2, '0')}-${String(p.date.day).padStart(2, '0')}`;
    formStartHour.value = p.hour;
    formStartMinute.value = p.minute;
}

function hydrateEndSplitFromLocal(): void {
    const v = formEndLocal.value.trim();
    const p = parseDatetimeLocalParts(v);

    if (!p) {
        formEndDate.value = '';
        formEndHour.value = 9;
        formEndMinute.value = 0;

        return;
    }

    formEndDate.value = `${p.date.year}-${String(p.date.month).padStart(2, '0')}-${String(p.date.day).padStart(2, '0')}`;
    formEndHour.value = p.hour;
    formEndMinute.value = p.minute;
}

function clampStartTimeParts(): void {
    const d = formStartDate.value.trim();

    if (!isValidLocalDateString(d)) {
        return;
    }

    const constraintsActive =
        freeWindows.value.length > 0 && !freeWindowsUnavailable.value;

    if (!constraintsActive) {
        return;
    }

    const hAllowed = getAllowedHoursForDate(freeWindows.value, d);

    if (hAllowed && hAllowed.length > 0) {
        let h = formStartHour.value;

        if (!hAllowed.includes(h)) {
            h = hAllowed[0] ?? h;
            formStartHour.value = h;
        }
    }

    const mAllowed = getAllowedMinutesForDateHour(
        freeWindows.value,
        d,
        formStartHour.value,
    );

    if (mAllowed && mAllowed.length > 0) {
        let mi = formStartMinute.value;

        if (!mAllowed.includes(mi)) {
            mi = mAllowed[0] ?? mi;
            formStartMinute.value = mi;
        }
    }
}

function clampEndTimeParts(): void {
    const d = formEndDate.value.trim();

    if (!isValidLocalDateString(d)) {
        return;
    }

    const constraintsActive =
        freeWindows.value.length > 0 && !freeWindowsUnavailable.value;

    if (!constraintsActive) {
        return;
    }

    const hAllowed = getAllowedHoursForEnd(
        freeWindows.value,
        formStartLocal.value.trim(),
        d,
    );

    if (hAllowed && hAllowed.length > 0) {
        let h = formEndHour.value;

        if (!hAllowed.includes(h)) {
            h = hAllowed[0] ?? h;
            formEndHour.value = h;
        }
    }

    const mAllowed = getAllowedMinutesForEndHour(
        freeWindows.value,
        formStartLocal.value.trim(),
        d,
        formEndHour.value,
    );

    if (mAllowed && mAllowed.length > 0) {
        let mi = formEndMinute.value;

        if (!mAllowed.includes(mi)) {
            mi = mAllowed[0] ?? mi;
            formEndMinute.value = mi;
        }
    }
}

function commitStartLocal(): void {
    const d = formStartDate.value.trim();

    if (!isValidLocalDateString(d)) {
        formStartLocal.value = '';

        return;
    }

    clampStartTimeParts();
    const cd = isoDateStringToCalendarDate(d);

    if (!cd) {
        formStartLocal.value = '';

        return;
    }

    formStartLocal.value = buildDatetimeLocal(
        cd,
        formStartHour.value,
        formStartMinute.value,
    );
}

function commitEndLocal(): void {
    const d = formEndDate.value.trim();

    if (!isValidLocalDateString(d)) {
        formEndLocal.value = '';

        return;
    }

    clampEndTimeParts();
    const cd = isoDateStringToCalendarDate(d);

    if (!cd) {
        formEndLocal.value = '';

        return;
    }

    formEndLocal.value = buildDatetimeLocal(
        cd,
        formEndHour.value,
        formEndMinute.value,
    );
}

function handleStartDateChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;

    formStartDate.value = raw.trim();
    clampStartTimeParts();
    commitStartLocal();
}

function handleStartHourChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    const h = Number.parseInt(raw, 10);

    if (!Number.isFinite(h) || h < 0 || h > 23) {
        return;
    }

    formStartHour.value = h;
    clampStartTimeParts();
    commitStartLocal();
}

function handleStartMinuteChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    const m = Number.parseInt(raw, 10);

    if (!Number.isFinite(m) || m < 0 || m > 59) {
        return;
    }

    formStartMinute.value = m;
    commitStartLocal();
}

function handleEndDateChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;

    formEndDate.value = raw.trim();
    clampEndTimeParts();
    commitEndLocal();
}

function handleEndHourChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    const h = Number.parseInt(raw, 10);

    if (!Number.isFinite(h) || h < 0 || h > 23) {
        return;
    }

    formEndHour.value = h;
    clampEndTimeParts();
    commitEndLocal();
}

function handleEndMinuteChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    const m = Number.parseInt(raw, 10);

    if (!Number.isFinite(m) || m < 0 || m > 59) {
        return;
    }

    formEndMinute.value = m;
    commitEndLocal();
}

watch(formStartLocal, () => {
    hydrateStartSplitFromLocal();
});

watch(formEndLocal, () => {
    hydrateEndSplitFromLocal();
});

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

const theoryCapacitySummary = computed((): string | null => {
    const d = theoryEligibleData.value;

    if (!d) {
        return null;
    }

    const { limit, used, remaining } = d.capacity;

    if (limit === null) {
        return `Miejsca na evencie: ${used} (bez limitu)`;
    }

    const rem =
        remaining === null ? '—' : String(Math.max(0, Math.trunc(remaining)));

    return `Miejsca: ${used} / ${limit} (wolnych: ${rem})`;
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

function isPatchParticipantConflict(err: unknown): boolean {
    if (getErrorStatusCode(err) !== 409) {
        return false;
    }

    const msg = getApiFetchErrorMessage(err, '').toLowerCase();

    return msg.includes('participant schedules');
}

/** Czy zmieniono początek, koniec lub instruktora względem baseline (walidacja wolnych okien). */
function needsTimeOrInstructorSlotValidation(): boolean {
    const a = baselineSnapshot.value;
    const b = currentSnapshot.value;

    if (!a || !b) {
        return false;
    }

    return (
        a.start !== b.start ||
        a.end !== b.end ||
        a.instructorId !== b.instructorId
    );
}

function syncFreeWindowsFromEvent(ev: InstructorEvent): void {
    const fw = ev.freeWindows;

    if (!Array.isArray(fw)) {
        return;
    }

    freeWindows.value = fw;
    freeWindowsUnavailable.value = fw.length === 0;
}

async function refreshFreeWindowsFromSlots(date: string): Promise<void> {
    const instId = formInstructorId.value.trim();
    const d = date.trim();

    if (!instId || !d) {
        return;
    }

    try {
        const slots = await fetchInstructorSlots(d, d);
        const windows = slotsToFreeWindows(slots, d);

        freeWindows.value = windows;
        freeWindowsUnavailable.value = windows.length === 0;
    } catch {
        /* zachowaj poprzednie okna przy błędzie sieci */
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
        const ev = await fetchEventById(id, { includeSlots: true });

        if (seq !== loadSeq) {
            return;
        }

        loadedEvent.value = ev;
        skipSlotsRefreshAfterLoad = true;
        applyPrefill(ev);
        syncFreeWindowsFromEvent(ev);
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

async function loadTheoryEligibleStudents(): Promise<void> {
    theoryEligibleError.value = null;
    theoryEligibleData.value = null;
    theoryEligibleNoCourse.value = false;

    const id = eventId.value.trim();
    const ev = loadedEvent.value;

    if (
        !id ||
        !ev ||
        String(ev.type ?? '')
            .trim()
            .toUpperCase() !== 'THEORY'
    ) {
        return;
    }

    if (!ev.courseId?.trim()) {
        theoryEligibleNoCourse.value = true;

        return;
    }

    isTheoryEligibleLoading.value = true;

    try {
        theoryEligibleData.value = await fetchTheoryEventEligibleStudents(id);
    } catch (err: unknown) {
        theoryEligibleData.value = null;
        theoryEligibleError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się wczytać listy kwalifikacji kursantów (kurs).',
        );
    } finally {
        isTheoryEligibleLoading.value = false;
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

watch(
    () =>
        [
            loadedEvent.value?.courseId?.trim() ?? '',
            schoolId.value.trim(),
        ] as const,
    async ([cid, sid]) => {
        linkedCourseLabel.value = null;
        linkedCourse.value = null;

        if (!cid || !sid) {
            return;
        }

        try {
            const d = await fetchCourseById(cid);

            linkedCourseLabel.value = d.name.trim() || null;
            linkedCourse.value = d;
        } catch {
            linkedCourseLabel.value = null;
            linkedCourse.value = null;
        }
    },
    { immediate: true },
);

watch(
    () =>
        [
            loadedEvent.value?.id ?? '',
            String(loadedEvent.value?.type ?? '')
                .trim()
                .toUpperCase(),
            loadedEvent.value?.courseId?.trim() ?? '',
        ] as const,
    () => {
        void loadTheoryEligibleStudents();
    },
    { immediate: true },
);

watch(
    () => {
        const ev = loadedEvent.value;

        if (!ev) {
            return null;
        }

        const ids = ev.studentUserIds;
        const arr = Array.isArray(ids)
            ? ids.map((x) => String(x).trim()).filter(Boolean)
            : [];

        return [ev.id, sortedStudentIds(arr).join(',')] as const;
    },
    (key) => {
        if (!key) {
            theoryStudentsBaseline.value = [];
            draftTheoryStudentUserIds.value = [];

            return;
        }

        const ev = loadedEvent.value;

        if (!ev) {
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

const currentFormDate = computed(() => {
    const d = formStartDate.value.trim();

    if (isValidLocalDateString(d)) {
        return d;
    }

    return formStartLocal.value.trim().slice(0, 10);
});

const pickerConstraintsActive = computed(
    () => freeWindows.value.length > 0 && !freeWindowsUnavailable.value,
);

const pickerCalendarBounds = computed(() => {
    if (!pickerConstraintsActive.value) {
        return null;
    }

    return getLocalDateBoundsForCalendar(freeWindows.value);
});

const pickerMinDate = computed(() => pickerCalendarBounds.value?.minDate);

const pickerMaxDate = computed(() => pickerCalendarBounds.value?.maxDate);

const startDateStr = computed(() => {
    const d = formStartDate.value.trim();

    if (isValidLocalDateString(d)) {
        return d;
    }

    return formStartLocal.value.trim().slice(0, 10);
});

const endDateStr = computed(() => {
    const d = formEndDate.value.trim();

    if (isValidLocalDateString(d)) {
        return d;
    }

    return formEndLocal.value.trim().slice(0, 10);
});

const startHourOptions = computed(() => {
    if (!pickerConstraintsActive.value) {
        return undefined;
    }

    const d = startDateStr.value;

    if (!isValidLocalDateString(d)) {
        return undefined;
    }

    return getAllowedHoursForDate(freeWindows.value, d) ?? undefined;
});

const startMinuteOptions = computed(() => {
    if (!pickerConstraintsActive.value) {
        return undefined;
    }

    const d = startDateStr.value;

    if (!isValidLocalDateString(d)) {
        return undefined;
    }

    return (
        getAllowedMinutesForDateHour(
            freeWindows.value,
            d,
            formStartHour.value,
        ) ?? undefined
    );
});

const endHourOptions = computed(() => {
    if (!pickerConstraintsActive.value) {
        return undefined;
    }

    const d = endDateStr.value;

    if (!isValidLocalDateString(d)) {
        return undefined;
    }

    return (
        getAllowedHoursForEnd(
            freeWindows.value,
            formStartLocal.value.trim(),
            d,
        ) ?? undefined
    );
});

const endMinuteOptions = computed(() => {
    if (!pickerConstraintsActive.value) {
        return undefined;
    }

    const d = endDateStr.value;

    if (!isValidLocalDateString(d)) {
        return undefined;
    }

    return (
        getAllowedMinutesForEndHour(
            freeWindows.value,
            formStartLocal.value.trim(),
            d,
            formEndHour.value,
        ) ?? undefined
    );
});

const startHourOptionsResolved = computed(
    () => startHourOptions.value ?? FULL_HOUR_OPTIONS,
);

const startMinuteOptionsResolved = computed(
    () => startMinuteOptions.value ?? FULL_MINUTE_OPTIONS,
);

const endHourOptionsResolved = computed(
    () => endHourOptions.value ?? FULL_HOUR_OPTIONS,
);

const endMinuteOptionsResolved = computed(
    () => endMinuteOptions.value ?? FULL_MINUTE_OPTIONS,
);

watch(
    [currentFormDate, formInstructorId],
    ([newDate, newInst], [oldDate, oldInst]) => {
        if (skipSlotsRefreshAfterLoad) {
            skipSlotsRefreshAfterLoad = false;

            return;
        }

        if (newDate === oldDate && newInst === oldInst) {
            return;
        }

        const d = newDate?.trim();
        const ins = (newInst ?? '').trim();

        if (!d || !ins) {
            return;
        }

        void refreshFreeWindowsFromSlots(d);
    },
);

watch([formStartLocal, formEndLocal], () => {
    const ev = loadedEvent.value;
    const id = eventId.value.trim();

    if (
        !id ||
        !ev?.courseId?.trim() ||
        String(ev.type ?? '')
            .trim()
            .toUpperCase() !== 'THEORY'
    ) {
        return;
    }

    const startIso = localDatetimeToIso(formStartLocal.value);
    const endIso = localDatetimeToIso(formEndLocal.value);

    if (!startIso || !endIso) {
        return;
    }

    if (eligibleDebounceTimer) {
        clearTimeout(eligibleDebounceTimer);
    }

    eligibleDebounceTimer = setTimeout(async () => {
        const seq = ++eligibleSeq;

        try {
            const data = await fetchTheoryEventEligibleStudents(id, {
                startTime: startIso,
                endTime: endIso,
            });

            if (seq !== eligibleSeq) {
                return;
            }

            theoryEligibleData.value = data;
            theoryEligibleError.value = null;
        } catch (err: unknown) {
            if (seq !== eligibleSeq) {
                return;
            }

            theoryEligibleError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się odświeżyć listy kursantów.',
            );
        }
    }, 400);
});

watch([formStartLocal, formEndLocal], () => {
    const startIso = localDatetimeToIso(formStartLocal.value);
    const endIso = localDatetimeToIso(formEndLocal.value);

    if (!startIso || !endIso) {
        return;
    }

    const startT = new Date(startIso).getTime();
    const endT = new Date(endIso).getTime();

    if (endT <= startT) {
        const suggested = suggestDefaultEndLocal(
            pickerConstraintsActive.value ? freeWindows.value : [],
            formStartLocal.value.trim(),
        );

        if (suggested) {
            formEndLocal.value = suggested;

            return;
        }

        formEndLocal.value = formStartLocal.value;
    }
});

onBeforeUnmount(() => {
    if (eligibleDebounceTimer) {
        clearTimeout(eligibleDebounceTimer);
    }
});

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

function isTheoryEligibleRowInteractive(
    row: TheoryEventEligibleStudentRow,
): boolean {
    return row.isAssignedToEvent || row.canAssign;
}

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

    const shouldRefreshSlotsAfterPatch = needsTimeOrInstructorSlotValidation();

    if (fieldsDirty) {
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

        if (shouldRefreshSlotsAfterPatch) {
            const dStart = new Date(startIso);
            const dEnd = new Date(endIso);

            if (
                freeWindowsUnavailable.value ||
                !isSlotWithinFreeWindows(freeWindows.value, dStart, dEnd)
            ) {
                formError.value = freeWindowsUnavailable.value
                    ? 'Instruktor nie ma dostępności w tym dniu — zmień datę lub instruktora.'
                    : 'Wybrany przedział czasu nie mieści się w wolnym oknie grafiku instruktora.';

                return;
            }
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
            const updated = await updateInstructorEvent(id, payload);
            const prev = loadedEvent.value;

            if (prev) {
                loadedEvent.value = {
                    ...prev,
                    ...updated,
                    studentUserIds: prev.studentUserIds,
                    studentAttendanceKnown: prev.studentAttendanceKnown,
                    students: prev.students,
                };
            }

            if (shouldRefreshSlotsAfterPatch) {
                const dateStr = formStartLocal.value.trim().slice(0, 10);

                if (dateStr) {
                    await refreshFreeWindowsFromSlots(dateStr);
                }
            }
        } catch (err: unknown) {
            const msg = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać zmian.',
            );

            if (
                getErrorStatusCode(err) === 409 &&
                !isPatchParticipantConflict(err)
            ) {
                const dateStr = formStartLocal.value.trim().slice(0, 10);

                if (dateStr) {
                    await refreshFreeWindowsFromSlots(dateStr);
                }
            }

            formError.value = msg;

            return;
        }
    }

    if (participantsDirty) {
        try {
            await replaceStudentsOnEvent(
                id,
                sortedStudentIds(draftTheoryStudentUserIds.value),
            );
        } catch (err: unknown) {
            const msg = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać listy kursantów.',
            );

            if (getErrorStatusCode(err) === 409) {
                try {
                    const evReload = await fetchEventById(id, {
                        includeSlots: true,
                    });

                    loadedEvent.value = evReload;
                    applyPrefill(evReload);
                    syncFreeWindowsFromEvent(evReload);

                    const ids = evReload.studentUserIds;
                    const arr = Array.isArray(ids)
                        ? ids.map((x) => String(x).trim()).filter(Boolean)
                        : [];

                    theoryStudentsBaseline.value = sortedStudentIds(arr);
                    draftTheoryStudentUserIds.value = [...arr];

                    const startIso = localDatetimeToIso(formStartLocal.value);
                    const endIso = localDatetimeToIso(formEndLocal.value);

                    if (
                        evReload.courseId?.trim() &&
                        startIso &&
                        endIso &&
                        String(evReload.type ?? '')
                            .trim()
                            .toUpperCase() === 'THEORY'
                    ) {
                        theoryEligibleData.value =
                            await fetchTheoryEventEligibleStudents(id, {
                                startTime: startIso,
                                endTime: endIso,
                            });
                        theoryEligibleError.value = null;
                    } else {
                        await loadTheoryEligibleStudents();
                    }
                } catch {
                    /* komunikat poniżej */
                }

                formError.value = shouldRefreshSlotsAfterPatch
                    ? 'Zmiany bloku zapisane, ale lista uczestników wymaga korekty — zdejmij lub zmień kursantów z kolizją grafiku i zapisz ponownie.'
                    : msg;

                return;
            }

            formError.value = msg;

            return;
        }
    }

    addToast({
        title: 'Zapisano zmiany',
        description: 'Wydarzenie zostało zaktualizowane.',
        variant: 'success',
    });

    await navigateTo(scheduleBackHref.value);
}

const deleteDialogOpen = ref(false);

const deleteDialogTimeLabel = computed(() => {
    const a = formStartLocal.value.trim();
    const b = formEndLocal.value.trim();

    if (!a || !b) {
        return '';
    }

    const da = new Date(a);
    const db = new Date(b);

    if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) {
        return '';
    }

    const fmt = new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
    });

    return `${fmt.format(da)} — ${fmt.format(db)}`;
});

function handleOpenDeleteDialog(): void {
    deleteDialogOpen.value = true;
}

function handleDeleteDialogCancel(): void {
    deleteDialogOpen.value = false;
}

async function handleDeleteDialogConfirm(): Promise<void> {
    const id = eventId.value.trim();

    if (!id) {
        return;
    }

    try {
        await deleteInstructorEvent(id);

        addToast({
            title: 'Usunięto blok czasu',
            description: 'Blok został usunięty z harmonogramu.',
            variant: 'success',
        });

        deleteDialogOpen.value = false;
        await navigateTo(scheduleBackHref.value);
    } catch (err: unknown) {
        addToast({
            title: 'Nie udało się usunąć wydarzenia',
            description: getApiFetchErrorMessage(
                err,
                'Spróbuj ponownie lub wróć do terminarza.',
            ),
            variant: 'error',
        });
    }
}

function handleEventStatusPatched(status: string): void {
    const ev = loadedEvent.value;

    if (!ev) {
        return;
    }

    loadedEvent.value = { ...ev, status };
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

                <div v-if="loadedEvent" class="space-y-2">
                    <p class="text-muted-foreground text-xs">
                        Status wydarzenia
                    </p>
                    <ManagerEventStatusSelect
                        :event-id="loadedEvent.id"
                        :status="loadedEvent.status"
                        @update:status="handleEventStatusPatched"
                    />
                </div>

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
                                            !qualifiedInstructorsForEvent.some(
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
                                        v-for="i in qualifiedInstructorsForEvent"
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
                            <UiLabel for="edit-event-start-date"
                                >Początek</UiLabel
                            >
                            <div class="space-y-2">
                                <div class="space-y-1">
                                    <label
                                        class="text-muted-foreground text-xs font-medium"
                                        for="edit-event-start-date"
                                    >
                                        Data
                                    </label>
                                    <input
                                        id="edit-event-start-date"
                                        type="date"
                                        :value="formStartDate"
                                        :disabled="isSaving"
                                        :min="pickerMinDate ?? undefined"
                                        :max="pickerMaxDate ?? undefined"
                                        class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label="Data początku"
                                        aria-required="true"
                                        @change="handleStartDateChange"
                                    />
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="space-y-1">
                                        <label
                                            class="text-muted-foreground text-xs font-medium"
                                            for="edit-event-start-hour"
                                        >
                                            Godz.
                                        </label>
                                        <select
                                            id="edit-event-start-hour"
                                            :value="formStartHour"
                                            :disabled="isSaving"
                                            class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Godzina początku"
                                            @change="handleStartHourChange"
                                        >
                                            <option
                                                v-for="h in startHourOptionsResolved"
                                                :key="`sh-${h}`"
                                                :value="h"
                                            >
                                                {{ String(h).padStart(2, '0') }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="space-y-1">
                                        <label
                                            class="text-muted-foreground text-xs font-medium"
                                            for="edit-event-start-minute"
                                        >
                                            Min.
                                        </label>
                                        <select
                                            id="edit-event-start-minute"
                                            :value="formStartMinute"
                                            :disabled="isSaving"
                                            class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Minuta początku"
                                            @change="handleStartMinuteChange"
                                        >
                                            <option
                                                v-for="m in startMinuteOptionsResolved"
                                                :key="`sm-${m}`"
                                                :value="m"
                                            >
                                                {{ String(m).padStart(2, '0') }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <UiLabel for="edit-event-end-date">Koniec</UiLabel>
                            <div class="space-y-2">
                                <div class="space-y-1">
                                    <label
                                        class="text-muted-foreground text-xs font-medium"
                                        for="edit-event-end-date"
                                    >
                                        Data
                                    </label>
                                    <input
                                        id="edit-event-end-date"
                                        type="date"
                                        :value="formEndDate"
                                        :disabled="isSaving"
                                        :min="pickerMinDate ?? undefined"
                                        :max="pickerMaxDate ?? undefined"
                                        class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label="Data końca"
                                        aria-required="true"
                                        @change="handleEndDateChange"
                                    />
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="space-y-1">
                                        <label
                                            class="text-muted-foreground text-xs font-medium"
                                            for="edit-event-end-hour"
                                        >
                                            Godz.
                                        </label>
                                        <select
                                            id="edit-event-end-hour"
                                            :value="formEndHour"
                                            :disabled="isSaving"
                                            class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Godzina końca"
                                            @change="handleEndHourChange"
                                        >
                                            <option
                                                v-for="h in endHourOptionsResolved"
                                                :key="`eh-${h}`"
                                                :value="h"
                                            >
                                                {{ String(h).padStart(2, '0') }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="space-y-1">
                                        <label
                                            class="text-muted-foreground text-xs font-medium"
                                            for="edit-event-end-minute"
                                        >
                                            Min.
                                        </label>
                                        <select
                                            id="edit-event-end-minute"
                                            :value="formEndMinute"
                                            :disabled="isSaving"
                                            class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Minuta końca"
                                            @change="handleEndMinuteChange"
                                        >
                                            <option
                                                v-for="m in endMinuteOptionsResolved"
                                                :key="`em-${m}`"
                                                :value="m"
                                            >
                                                {{ String(m).padStart(2, '0') }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p
                        v-if="isSlotsLoading"
                        class="text-muted-foreground text-xs"
                        role="status"
                    >
                        Aktualizacja dostępnych okien grafiku…
                    </p>
                    <p
                        v-if="freeWindowsUnavailable"
                        class="border-border rounded-md border border-dashed px-3 py-2 text-sm text-amber-700 dark:text-amber-500"
                        role="alert"
                    >
                        Instruktor nie ma dostępności w tym dniu — zmień datę
                        lub instruktora, aby wybrać godziny bloku.
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
                            variant="outline"
                            :disabled="isSaving || isDeleteLoading"
                            @click="handleCancel"
                        >
                            Anuluj
                        </UiButton>
                        <UiButton
                            type="submit"
                            :disabled="
                                isSaving || isDeleteLoading || !isFormDirty
                            "
                        >
                            {{ isSaving ? 'Zapisywanie…' : 'Zapisz zmiany' }}
                        </UiButton>
                    </div>
                </form>

                <div class="border-border max-w-xl border-t pt-4">
                    <UiButton
                        type="button"
                        variant="destructive"
                        :disabled="isSaving || isDeleteLoading"
                        :aria-busy="isDeleteLoading"
                        aria-label="Usuń to wydarzenie z harmonogramu"
                        @click="handleOpenDeleteDialog"
                    >
                        Usuń wydarzenie
                    </UiButton>
                </div>
            </section>

            <section
                v-if="formType === 'THEORY'"
                class="border-border bg-card max-w-xl space-y-6 rounded-xl border p-6 shadow-sm"
                aria-labelledby="event-theory-students-heading"
            >
                <div>
                    <h2
                        id="event-theory-students-heading"
                        class="text-foreground text-lg font-semibold"
                    >
                        Kursanci (teoria)
                    </h2>
                    <p class="text-muted-foreground mt-1 text-sm">
                        Lista pochodzi z
                        <code class="text-xs"
                            >GET /api/events/:id/eligible-students</code
                        >
                        (wszyscy kursanci kursu). Zaznaczenie oznacza zapis na
                        tym wydarzeniu — stan początkowy jest zgodny z
                        <code class="text-xs">GET /api/events/:id</code>
                        . Zapisz zmiany w sekcji „Dane bloku”. Wymagany jest
                        <code class="text-xs">?schoolId=</code>
                        w adresie strony.
                    </p>
                </div>

                <p
                    v-if="loadedEvent?.courseId?.trim()"
                    class="text-muted-foreground border-border rounded-md border border-dashed px-3 py-2 text-sm"
                    role="status"
                >
                    <span class="text-foreground font-medium">Kurs:</span>
                    {{ linkedCourseLabel ?? loadedEvent.courseId }}
                </p>

                <p
                    v-if="theoryCapacitySummary"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    {{ theoryCapacitySummary }}
                </p>

                <p
                    v-if="parseCapacity(formCapacityInput) === 0"
                    class="border-border rounded-md border border-dashed px-3 py-2 text-sm text-amber-700 dark:text-amber-500"
                    role="status"
                >
                    Limit miejsc wynosi 0 — żaden kursant nie może zostać
                    przypisany do tego bloku.
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

                <div v-else class="space-y-3">
                    <p
                        v-if="theoryEligibleNoCourse"
                        class="text-muted-foreground border-border rounded-md border border-dashed px-3 py-2 text-sm"
                        role="status"
                    >
                        Ten blok nie ma przypisanego kursu (
                        <code class="text-xs">courseId</code>
                        ) — lista kursantów jest niedostępna.
                    </p>
                    <p
                        v-else-if="isTheoryEligibleLoading"
                        class="text-muted-foreground text-sm"
                        role="status"
                    >
                        Wczytywanie listy kursantów…
                    </p>
                    <p
                        v-else-if="theoryEligibleError"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{ theoryEligibleError }}
                    </p>
                    <ul
                        v-else-if="
                            theoryEligibleData &&
                            theoryEligibleData.students.length > 0
                        "
                        class="space-y-2"
                        role="list"
                        aria-label="Kursanci kursu — zaznacz uczestników wydarzenia"
                    >
                        <li
                            v-for="row in theoryEligibleData.students"
                            :key="row.userId"
                            class="border-input flex flex-col gap-2 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div class="flex min-w-0 flex-1 items-start gap-3">
                                <UiCheckbox
                                    :id="`theory-student-${row.userId}`"
                                    :model-value="
                                        isTheoryRowChecked(
                                            theoryEligibleRowToStudentListItem(
                                                row,
                                            ),
                                        )
                                    "
                                    :disabled="
                                        isSaving ||
                                        !schoolId ||
                                        !isTheoryEligibleRowInteractive(row)
                                    "
                                    :aria-label="`Zapis na wydarzenie: ${formatStudentDisplayName(theoryEligibleRowToStudentListItem(row))}`"
                                    @update:model-value="
                                        handleToggleTheoryStudent(
                                            theoryEligibleRowToStudentListItem(
                                                row,
                                            ),
                                            $event === true,
                                        )
                                    "
                                />
                                <UiLabel
                                    :for="`theory-student-${row.userId}`"
                                    class="text-foreground min-w-0 flex-1 cursor-pointer text-sm leading-snug font-normal peer-disabled:cursor-not-allowed"
                                >
                                    {{
                                        formatStudentDisplayName(
                                            theoryEligibleRowToStudentListItem(
                                                row,
                                            ),
                                        )
                                    }}
                                    <span
                                        v-if="row.email?.trim()"
                                        class="text-muted-foreground block text-xs font-normal"
                                    >
                                        {{ row.email.trim() }}
                                    </span>
                                </UiLabel>
                            </div>
                            <div
                                class="flex shrink-0 flex-wrap gap-1 sm:justify-end"
                            >
                                <UiBadge
                                    v-if="row.hasScheduleConflict"
                                    variant="destructive"
                                >
                                    Kolizja grafiku
                                </UiBadge>
                                <UiBadge
                                    v-if="
                                        !row.canAssign && !row.isAssignedToEvent
                                    "
                                    variant="secondary"
                                >
                                    Niedostępny
                                </UiBadge>
                            </div>
                        </li>
                    </ul>
                    <p
                        v-else
                        class="text-muted-foreground text-sm"
                        role="status"
                    >
                        Brak kursantów na kursie lub lista nie została wczytana.
                    </p>
                </div>

                <p
                    v-if="theoryStudentsError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ theoryStudentsError }}
                </p>
            </section>

            <ManagerInstructorEventDeleteDialog
                v-model:open="deleteDialogOpen"
                :time-range-label="deleteDialogTimeLabel"
                :is-deleting="isDeleteLoading"
                @cancel="handleDeleteDialogCancel"
                @confirm="handleDeleteDialogConfirm"
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
