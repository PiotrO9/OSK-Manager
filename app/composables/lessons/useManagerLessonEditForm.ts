import type { Ref } from 'vue';
import type {
    ManagerLessonDetail,
    PatchManagerLessonPayload,
} from '~/types/lessons/managerLesson';
import { isoInstantToDatetimeLocalString } from '~/utils/date/weeklyCalendarDates';
import { polishLocalDateTimeToIso } from '~/utils/date/polishScheduleTime';
import { useScheduleAvailabilityCheck } from '~/composables/schedule/useScheduleAvailabilityCheck';
import { useScheduleAvailabilityOptions } from '~/composables/schedule/useScheduleAvailabilityOptions';
import type {
    LessonEditAvailabilityOptionsRequest,
    LessonEditAvailabilityRequest,
} from '~/types/schedule/scheduleAvailability';

export interface ManagerLessonEditSnapshot {
    start: string;
    end: string;
    vehicle: string;
    instructorId: string;
}

export interface ManagerLessonEditFormValues {
    start: string;
    end: string;
    vehicle: string;
    instructorId: string;
}

export type ManagerLessonPatchBuildResult =
    | { ok: true; payload: PatchManagerLessonPayload }
    | { ok: false; error: string };

export function managerLessonIsoToDatetimeLocal(iso: string): string {
    return isoInstantToDatetimeLocalString(iso);
}

export function managerLessonLocalDatetimeToIso(local: string): string | null {
    return polishLocalDateTimeToIso(local);
}

export function buildManagerLessonBaselineSnapshot(
    lesson: ManagerLessonDetail,
): ManagerLessonEditSnapshot {
    return {
        start: managerLessonIsoToDatetimeLocal(lesson.startTime),
        end: managerLessonIsoToDatetimeLocal(lesson.endTime),
        vehicle: (lesson.vehicleId ?? '').trim(),
        instructorId: lesson.instructorId.trim(),
    };
}

export function buildManagerLessonCurrentSnapshot(
    values: ManagerLessonEditFormValues,
): ManagerLessonEditSnapshot {
    return {
        start: values.start,
        end: values.end,
        vehicle: values.vehicle.trim(),
        instructorId: values.instructorId.trim(),
    };
}

export function areManagerLessonSnapshotsEqual(
    a: ManagerLessonEditSnapshot | null,
    b: ManagerLessonEditSnapshot | null,
): boolean {
    if (!a || !b) {
        return false;
    }

    return (
        a.start === b.start &&
        a.end === b.end &&
        a.vehicle === b.vehicle &&
        a.instructorId === b.instructorId
    );
}

export function buildManagerLessonPatchPayload(
    base: ManagerLessonEditSnapshot | null,
    values: ManagerLessonEditFormValues,
): ManagerLessonPatchBuildResult {
    if (!base) {
        return { ok: false, error: 'Brak danych wyjściowych lekcji.' };
    }

    const startIso = managerLessonLocalDatetimeToIso(values.start);
    const endIso = managerLessonLocalDatetimeToIso(values.end);

    if (!startIso || !endIso) {
        return {
            ok: false,
            error: 'Podaj początek i koniec lekcji (data i godzina).',
        };
    }

    if (values.start.slice(0, 10) !== values.end.slice(0, 10)) {
        return {
            ok: false,
            error: 'Początek i koniec lekcji muszą przypadać tego samego dnia.',
        };
    }

    if (new Date(startIso).getTime() >= new Date(endIso).getTime()) {
        return { ok: false, error: 'Koniec musi być później niż początek.' };
    }

    const vehicleId = values.vehicle.trim();

    if (!vehicleId) {
        return { ok: false, error: 'Wybierz pojazd.' };
    }

    const instructorId = values.instructorId.trim();

    if (!instructorId) {
        return { ok: false, error: 'Wybierz instruktora.' };
    }

    const payload: PatchManagerLessonPayload = {};

    if (base.start !== values.start) {
        payload.startTime = startIso;
    }

    if (base.end !== values.end) {
        payload.endTime = endIso;
    }

    if (base.vehicle !== vehicleId) {
        payload.vehicleId = vehicleId;
    }

    if (base.instructorId !== instructorId) {
        payload.instructorId = instructorId;
    }

    return { ok: true, payload };
}

export function useManagerLessonEditForm(
    loadedLesson: Ref<ManagerLessonDetail | null>,
) {
    const formStartLocal = ref('');
    const formEndLocal = ref('');
    const formVehicleId = ref('');
    const formInstructorId = ref('');
    const formError = ref<string | null>(null);

    function applyPrefill(lesson: ManagerLessonDetail): void {
        formStartLocal.value = managerLessonIsoToDatetimeLocal(
            lesson.startTime,
        );
        formEndLocal.value = managerLessonIsoToDatetimeLocal(lesson.endTime);
        formVehicleId.value = lesson.vehicleId?.trim() ? lesson.vehicleId : '';
        formInstructorId.value = lesson.instructorId.trim();
        formError.value = null;
    }

    const baselineSnapshot = computed((): ManagerLessonEditSnapshot | null => {
        const lesson = loadedLesson.value;

        return lesson ? buildManagerLessonBaselineSnapshot(lesson) : null;
    });

    const currentSnapshot = computed(
        (): ManagerLessonEditSnapshot =>
            buildManagerLessonCurrentSnapshot({
                start: formStartLocal.value,
                end: formEndLocal.value,
                vehicle: formVehicleId.value,
                instructorId: formInstructorId.value,
            }),
    );

    const isFormDirty = computed((): boolean => {
        return !areManagerLessonSnapshotsEqual(
            baselineSnapshot.value,
            currentSnapshot.value,
        );
    });

    const availabilityCandidate =
        computed<LessonEditAvailabilityRequest | null>(() => {
            const lesson = loadedLesson.value;
            const [date = '', startTime = ''] = formStartLocal.value.split('T');
            const [endDate = '', endTime = ''] = formEndLocal.value.split('T');
            const instructorId = formInstructorId.value.trim();
            const vehicleId = formVehicleId.value.trim();

            if (
                !lesson ||
                !date ||
                !startTime ||
                !endTime ||
                endDate !== date ||
                !instructorId ||
                !vehicleId
            ) {
                return null;
            }

            return {
                intent: 'lesson_edit',
                lessonId: lesson.id,
                instructorId,
                vehicleId,
                date,
                startTime,
                endTime,
            };
        });
    const availability = useScheduleAvailabilityCheck({
        candidate: availabilityCandidate,
        auto: false,
    });
    const availabilityOptionsCandidate =
        computed<LessonEditAvailabilityOptionsRequest | null>(() => {
            const lesson = loadedLesson.value;
            const [date = ''] = formStartLocal.value.split('T');
            const instructorId = formInstructorId.value.trim();
            const vehicleId = formVehicleId.value.trim();

            if (!lesson || !date || !instructorId) return null;

            return {
                intent: 'lesson_edit',
                lessonId: lesson.id,
                instructorId,
                date,
                ...(vehicleId ? { vehicleId } : {}),
            };
        });
    const availabilityOptions = useScheduleAvailabilityOptions({
        candidate: availabilityOptionsCandidate,
    });
    const availableStartTimes = computed<readonly string[] | undefined>(() =>
        availabilityOptions.status.value === 'success'
            ? (availabilityOptions.result.value?.options.map(
                  (option) => option.startTime,
              ) ?? [])
            : undefined,
    );
    const availableEndTimes = computed<readonly string[] | undefined>(() => {
        if (availabilityOptions.status.value !== 'success') return undefined;

        const startTime = formStartLocal.value.split('T')[1] ?? '';

        return (
            availabilityOptions.result.value?.options.find(
                (option) => option.startTime === startTime,
            )?.endTimes ?? []
        );
    });
    const availableVehicleIds = computed<readonly string[] | undefined>(() =>
        availabilityOptions.status.value === 'success'
            ? availabilityOptions.result.value?.availableVehicleIds
            : undefined,
    );
    const isAvailabilityOptionsLoading = computed(
        () => availabilityOptions.status.value === 'loading',
    );
    const availabilityOptionsError = computed(() =>
        availabilityOptions.status.value === 'error'
            ? 'Nie udało się pobrać dostępnych godzin. Termin zostanie sprawdzony przy zapisie.'
            : '',
    );
    const lessonAvailabilityStatus = computed(() =>
        isFormDirty.value ? availability.status.value : 'idle',
    );
    const lessonAvailabilityMessage = computed(() =>
        isFormDirty.value ? availability.message.value : '',
    );

    watch(
        () => availabilityOptions.result.value,
        (next) => {
            if (!next || !formVehicleId.value.trim()) return;

            const first = next.options[0];

            if (!first) {
                formStartLocal.value = '';
                formEndLocal.value = '';

                return;
            }

            const date = availabilityOptionsCandidate.value?.date ?? '';
            const currentStart = formStartLocal.value.split('T')[1] ?? '';
            const currentEnd = formEndLocal.value.split('T')[1] ?? '';
            const selected = next.options.find(
                (option) => option.startTime === currentStart,
            );

            if (!selected) {
                const firstEnd = first.endTimes[0];

                if (!firstEnd) return;

                formStartLocal.value = `${date}T${first.startTime}`;
                formEndLocal.value = `${date}T${firstEnd}`;

                return;
            }

            if (!selected.endTimes.includes(currentEnd)) {
                const firstEnd = selected.endTimes[0];

                if (firstEnd) formEndLocal.value = `${date}T${firstEnd}`;
            }
        },
    );

    function buildPatchPayload(): ManagerLessonPatchBuildResult {
        return buildManagerLessonPatchPayload(baselineSnapshot.value, {
            start: formStartLocal.value,
            end: formEndLocal.value,
            vehicle: formVehicleId.value,
            instructorId: formInstructorId.value,
        });
    }

    return {
        formStartLocal,
        formEndLocal,
        formVehicleId,
        formInstructorId,
        formError,
        baselineSnapshot,
        currentSnapshot,
        isFormDirty,
        applyPrefill,
        buildPatchPayload,
        lessonAvailabilityStatus,
        lessonAvailabilityMessage,
        availableStartTimes,
        availableEndTimes,
        availableVehicleIds,
        isAvailabilityOptionsLoading,
        availabilityOptionsError,
        lessonMinDurationMinutes: computed(
            () =>
                availabilityOptions.result.value?.policy.minDurationMinutes ??
                availability.result.value?.policy.minDurationMinutes ??
                null,
        ),
        recheckLessonAvailability: availability.recheck,
    };
}
