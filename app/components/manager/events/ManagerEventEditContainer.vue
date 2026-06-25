<script setup lang="ts">
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import {
    instructorHasCourseCategoryQualification,
    type InstructorListItem,
} from '~/types/instructor';
import type { CourseDetail } from '~/types/course';
import type {
    FreeWindow,
    InstructorEvent,
    PatchInstructorEventPayload,
} from '~/types/instructorEvent';
import { formatStudentDisplayName } from '~/types/student';
import { theoryEligibleRowToStudentListItem } from '~/utils/theoryEventEligibleStudents';
import { isSlotWithinFreeWindows } from '~/utils/freeWindows';
import type { Vehicle } from '~/types/vehicle';

const { eventId, schoolId } = useManagerEventEditPage();

const loadedEvent = ref<InstructorEvent | null>(null);
const loadError = ref<string | null>(null);
const notFound = ref(false);

const freeWindows = ref<FreeWindow[]>([]);
const freeWindowsUnavailable = ref(false);

const {
    formType,
    formStartLocal,
    formEndLocal,
    formStartDate,
    formStartHour,
    formStartMinute,
    formEndDate,
    formEndHour,
    formEndMinute,
    formVehicleId,
    formInstructorId,
    formCapacityInput,
    formError,
    isFormFieldsDirty,
    currentFormDate,
    pickerMinDate,
    pickerMaxDate,
    startHourOptionsResolved,
    startMinuteOptionsResolved,
    endHourOptionsResolved,
    endMinuteOptionsResolved,
    applyPrefill,
    parseCapacity,
    localDatetimeToIso,
    needsTimeOrInstructorSlotValidation,
    handleStartDateChange,
    handleStartHourChange,
    handleStartMinuteChange,
    handleEndDateChange,
    handleEndHourChange,
    handleEndMinuteChange,
} = useManagerEventEditForm({
    loadedEvent,
    freeWindows,
    freeWindowsUnavailable,
});

const {
    isSlotsLoading,
    syncFreeWindowsFromEvent,
    refreshFreeWindowsFromSlots,
    skipNextSlotsRefresh,
} = useManagerEventSlots({
    formInstructorId,
    currentFormDate,
    freeWindows,
    freeWindowsUnavailable,
});
const vehicles = ref<Vehicle[]>([]);
const vehiclesError = ref<string | null>(null);
const isVehiclesLoading = ref(false);

const instructors = ref<InstructorListItem[]>([]);
const instructorsError = ref<string | null>(null);
const isInstructorsLoading = ref(false);

const {
    theoryStudentsError,
    theoryEligibleData,
    theoryEligibleError,
    isTheoryEligibleLoading,
    theoryEligibleNoCourse,
    draftTheoryStudentUserIds,
    theoryCapacitySummary,
    studentAttendanceKnown,
    isTheoryStudentsDirty,
    capacityForStudentPicker,
    sortedStudentIds,
    isTheoryRowChecked,
    isTheoryEligibleRowInteractive,
    handleToggleTheoryStudent,
    loadTheoryEligibleStudents,
    resetStudentDraftFromEvent,
    refreshEligibleForCurrentTime,
} = useManagerEventParticipants({
    eventId,
    loadedEvent,
    formStartLocal,
    formEndLocal,
    formCapacityInput,
    parseCapacity,
    localDatetimeToIso,
    fetchTheoryEventEligibleStudents,
});
/** Event THEORY bez `courseId` — brak endpointu eligible-students. */

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
/** Zaznaczenia przed zapisem formularza (checkboxy). */

/** Wolne okna czasu instruktora (GET includeSlots lub przeliczone z GET …/availability/slots). */
/** true gdy `freeWindows` jest pustą tablicą — brak dostępności w danym dniu. */
/** Po `loadEvent` — pomiń jeden refresh slotów (unikaj podwójnego GET). */

const isSaving = computed(() => isUpdateLoading.value || isReplacing.value);

let loadSeq = 0;

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
        skipNextSlotsRefresh();
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

                    const startIso = localDatetimeToIso(formStartLocal.value);
                    const endIso = localDatetimeToIso(formEndLocal.value);

                    resetStudentDraftFromEvent(evReload);

                    if (
                        evReload.courseId?.trim() &&
                        startIso &&
                        endIso &&
                        String(evReload.type ?? '')
                            .trim()
                            .toUpperCase() === 'THEORY'
                    ) {
                        await refreshEligibleForCurrentTime();
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

const headerDateRangeLabel = computed(() => {
    const a = formStartLocal.value.trim();
    const b = formEndLocal.value.trim();

    if (!a || !b) {
        return 'Termin';
    }

    const start = new Date(a);
    const end = new Date(b);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return 'Termin';
    }

    const sameDay = start.toDateString() === end.toDateString();
    const sameMonth =
        start.getFullYear() === end.getFullYear() &&
        start.getMonth() === end.getMonth();
    const dayFormatter = new Intl.DateTimeFormat('pl-PL', { day: '2-digit' });
    const monthFormatter = new Intl.DateTimeFormat('pl-PL', {
        month: 'long',
    });
    const compactFormatter = new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: 'short',
    });

    if (sameDay) {
        return `${dayFormatter.format(start)} ${monthFormatter.format(start)}`;
    }

    if (sameMonth) {
        return `${dayFormatter.format(start)}-${dayFormatter.format(end)} ${monthFormatter.format(end)}`;
    }

    return `${compactFormatter.format(start)} - ${compactFormatter.format(end)}`;
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
    <div class="space-y-5">
        <ManagerEventEditHeader
            :date-range-label="headerDateRangeLabel"
            :can-save="Boolean(loadedEvent) && isFormDirty"
            :is-saving="isSaving"
            :is-delete-loading="isDeleteLoading"
        />

        <p
            v-if="!schoolId"
            class="border-border rounded-xl border border-dashed bg-amber-50/60 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-300"
            role="status"
        >
            Dodaj <code class="text-xs">?schoolId=</code> w adresie, aby wybrać
            pojazd przy jazdzie, zmienić instruktora i zarządzać kursantami w
            teorii.
        </p>

        <ErrorState
            v-if="!eventId"
            title="Nieprawidłowy identyfikator wydarzenia"
            description="Adres strony nie zawiera poprawnego ID wydarzenia."
        >
            <template #action>
                <UiButton as-child variant="outline" class="bg-background">
                    <NuxtLink to="/manager/instructors">
                        Wróć do listy instruktorów
                    </NuxtLink>
                </UiButton>
            </template>
        </ErrorState>

        <LoadingState
            v-else-if="isFetchLoading && !loadedEvent && !notFound"
            title="Wczytywanie wydarzenia"
            description="Pobieramy dane bloku, instruktora i dostępne okna grafiku."
        />

        <template v-else-if="notFound">
            <ErrorState
                title="Wydarzenie nie zostało znalezione"
                description="Serwer zwrócił 404 dla tego bloku czasu."
            >
                <template #action>
                    <UiButton as-child variant="outline" class="bg-background">
                        <NuxtLink to="/manager/instructors">
                            Wróć do listy instruktorów
                        </NuxtLink>
                    </UiButton>
                </template>
            </ErrorState>
        </template>

        <template v-else-if="loadError">
            <ErrorState
                title="Nie udało się wczytać wydarzenia"
                :description="loadError"
                @retry="loadEvent"
            />
        </template>

        <template v-else-if="loadedEvent">
            <FormSection
                title="Edytuj wydarzenie"
                description="Formularz podzielony na logiczne sekcje, bez zmiany walidacji i flow."
            >
                <div class="mb-4 flex justify-end">
                    <UiBadge
                        variant="outline"
                        class="rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
                    >
                        FormSection
                    </UiBadge>
                </div>

                <div v-if="loadedEvent" class="mb-5 max-w-sm space-y-2">
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
                    id="event-edit-form"
                    class="space-y-5"
                    aria-label="Formularz edycji wydarzenia"
                    :aria-busy="isSaving"
                    @submit.prevent="handleSubmit"
                >
                    <ManagerEventResourceFields
                        v-model:instructor-id="formInstructorId"
                        v-model:vehicle-id="formVehicleId"
                        :event-type="formType"
                        :school-id="schoolId"
                        :instructors="qualifiedInstructorsForEvent"
                        :instructor-select-label="instructorSelectLabel"
                        :is-instructors-loading="isInstructorsLoading"
                        :instructors-error="instructorsError"
                        :vehicles="vehicles"
                        :is-vehicles-loading="isVehiclesLoading"
                        :vehicles-error="vehiclesError"
                        :is-saving="isSaving"
                    />
                    <ManagerEventTimeFields
                        :start-date="formStartDate"
                        :start-hour="formStartHour"
                        :start-minute="formStartMinute"
                        :end-date="formEndDate"
                        :end-hour="formEndHour"
                        :end-minute="formEndMinute"
                        :start-hour-options="startHourOptionsResolved"
                        :start-minute-options="startMinuteOptionsResolved"
                        :end-hour-options="endHourOptionsResolved"
                        :end-minute-options="endMinuteOptionsResolved"
                        :min-date="pickerMinDate"
                        :max-date="pickerMaxDate"
                        :is-saving="isSaving"
                        @start-date-change="handleStartDateChange"
                        @start-hour-change="handleStartHourChange"
                        @start-minute-change="handleStartMinuteChange"
                        @end-date-change="handleEndDateChange"
                        @end-hour-change="handleEndHourChange"
                        @end-minute-change="handleEndMinuteChange"
                    />

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

                    <ManagerEventEditActions
                        :is-saving="isSaving"
                        :is-delete-loading="isDeleteLoading"
                        :is-form-dirty="isFormDirty"
                        @cancel="handleCancel"
                    />
                </form>

                <template #footer>
                    <ManagerEventDeleteAction
                        :is-saving="isSaving"
                        :is-delete-loading="isDeleteLoading"
                        @delete="handleOpenDeleteDialog"
                    />
                </template>
            </FormSection>

            <FormSection
                v-if="formType === 'THEORY'"
                title="Kursanci (teoria)"
                description="Zarządzaj realną listą kursantów z kursu, z zachowaniem limitów i kolizji grafiku."
            >
                <div class="space-y-6">
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
                                <div
                                    class="flex min-w-0 flex-1 items-start gap-3"
                                >
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
                                            !row.canAssign &&
                                            !row.isAssignedToEvent
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
                            Brak kursantów na kursie lub lista nie została
                            wczytana.
                        </p>
                    </div>

                    <p
                        v-if="theoryStudentsError"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{ theoryStudentsError }}
                    </p>
                </div>
            </FormSection>

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
