import type { Ref } from 'vue';
import type {
    ManagerLessonDetail,
    PatchManagerLessonPayload,
} from '~/types/lessons/managerLesson';
import { isoInstantToDatetimeLocalString } from '~/utils/date/weeklyCalendarDates';

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
    };
}
