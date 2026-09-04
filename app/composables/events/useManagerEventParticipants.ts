import type { Ref } from 'vue';
import type {
    InstructorEvent,
    TheoryEventEligibleStudentRow,
    TheoryEventEligibleStudentsData,
} from '~/types/events/instructorEvent';
import type { StudentListItem } from '~/types/students/student';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    formatManagerEventTheoryCapacitySummary,
    getManagerEventCanonicalParticipantUserId,
    getManagerEventCapacityLimitError,
    isManagerEventEligibleRowInteractive,
    isManagerEventTheoryEvent,
    isManagerEventTheoryRowChecked,
    isManagerEventTheoryStudentsDirty,
    managerEventDraftIdBelongsToStudentRow,
    readManagerEventStudentUserIds,
    resolveManagerEventCapacityForStudentPicker,
    sortManagerEventParticipantIds,
} from '~/utils/events/managerEventParticipants';

type FetchTheoryEligibleStudents = (
    eventId: string,
    options?: { startTime?: string; endTime?: string },
) => Promise<TheoryEventEligibleStudentsData>;

export function useManagerEventParticipants(input: {
    eventId: Ref<string>;
    loadedEvent: Ref<InstructorEvent | null>;
    formStartLocal: Ref<string>;
    formEndLocal: Ref<string>;
    formCapacityInput: Ref<string | number>;
    parseCapacity: (raw: unknown) => number | null | false;
    localDatetimeToIso: (local: string) => string | null;
    fetchTheoryEventEligibleStudents: FetchTheoryEligibleStudents;
}) {
    const theoryStudentsError = ref<string | null>(null);
    const theoryEligibleData = ref<TheoryEventEligibleStudentsData | null>(
        null,
    );
    const theoryEligibleError = ref<string | null>(null);
    const isTheoryEligibleLoading = ref(false);
    const theoryEligibleNoCourse = ref(false);
    const theoryStudentsBaseline = ref<string[]>([]);
    const draftTheoryStudentUserIds = ref<string[]>([]);
    let eligibleDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    let eligibleSeq = 0;

    function isTheoryRowChecked(s: StudentListItem): boolean {
        return isManagerEventTheoryRowChecked({
            row: s,
            draftIds: draftTheoryStudentUserIds.value,
        });
    }

    const theoryCapacitySummary = computed((): string | null => {
        return formatManagerEventTheoryCapacitySummary(
            theoryEligibleData.value,
        );
    });

    const studentAttendanceKnown = computed(
        (): boolean => input.loadedEvent.value?.studentAttendanceKnown ?? false,
    );

    const isTheoryStudentsDirty = computed((): boolean => {
        const ev = input.loadedEvent.value;

        return isManagerEventTheoryStudentsDirty({
            event: ev,
            draftIds: draftTheoryStudentUserIds.value,
            baselineIds: theoryStudentsBaseline.value,
        });
    });

    const capacityForStudentPicker = computed((): number | null => {
        const parsed = input.parseCapacity(input.formCapacityInput.value);

        return resolveManagerEventCapacityForStudentPicker({
            parsedCapacity: parsed,
            eventCapacity: input.loadedEvent.value?.capacity,
        });
    });

    async function loadTheoryEligibleStudents(): Promise<void> {
        theoryEligibleError.value = null;
        theoryEligibleData.value = null;
        theoryEligibleNoCourse.value = false;

        const id = input.eventId.value.trim();
        const ev = input.loadedEvent.value;

        if (!id || !ev || !isManagerEventTheoryEvent(ev)) {
            return;
        }

        if (!ev.courseId?.trim()) {
            theoryEligibleNoCourse.value = true;

            return;
        }

        isTheoryEligibleLoading.value = true;

        try {
            theoryEligibleData.value =
                await input.fetchTheoryEventEligibleStudents(id);
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

    function resetStudentDraftFromEvent(ev: InstructorEvent | null): void {
        if (!ev) {
            theoryStudentsBaseline.value = [];
            draftTheoryStudentUserIds.value = [];

            return;
        }

        const arr = readManagerEventStudentUserIds(ev);

        theoryStudentsBaseline.value = sortManagerEventParticipantIds(arr);
        draftTheoryStudentUserIds.value = [...arr];
    }

    async function refreshEligibleForCurrentTime(): Promise<void> {
        const id = input.eventId.value.trim();
        const startIso = input.localDatetimeToIso(input.formStartLocal.value);
        const endIso = input.localDatetimeToIso(input.formEndLocal.value);

        if (!id || !startIso || !endIso) {
            return;
        }

        theoryEligibleData.value = await input.fetchTheoryEventEligibleStudents(
            id,
            {
                startTime: startIso,
                endTime: endIso,
            },
        );
        theoryEligibleError.value = null;
    }

    function isTheoryEligibleRowInteractive(
        row: TheoryEventEligibleStudentRow,
    ): boolean {
        return isManagerEventEligibleRowInteractive(row);
    }

    function handleToggleTheoryStudent(
        s: StudentListItem,
        next: boolean,
    ): void {
        theoryStudentsError.value = null;

        const cap = capacityForStudentPicker.value;

        const capacityError = getManagerEventCapacityLimitError({
            nextChecked: next,
            capacity: cap,
            isAlreadyChecked: isTheoryRowChecked(s),
            draftCount: draftTheoryStudentUserIds.value.length,
        });

        if (capacityError) {
            theoryStudentsError.value = capacityError;

            return;
        }

        if (next) {
            if (isTheoryRowChecked(s)) {
                return;
            }

            const canonical = getManagerEventCanonicalParticipantUserId(s);

            if (!canonical) {
                return;
            }

            draftTheoryStudentUserIds.value = [
                ...draftTheoryStudentUserIds.value,
                canonical,
            ];

            return;
        }

        draftTheoryStudentUserIds.value =
            draftTheoryStudentUserIds.value.filter(
                (id) => !managerEventDraftIdBelongsToStudentRow(s, id),
            );
    }

    watch(
        () =>
            [
                input.loadedEvent.value?.id ?? '',
                isManagerEventTheoryEvent(input.loadedEvent.value)
                    ? 'THEORY'
                    : String(input.loadedEvent.value?.type ?? '')
                          .trim()
                          .toUpperCase(),
                input.loadedEvent.value?.courseId?.trim() ?? '',
            ] as const,
        () => {
            void loadTheoryEligibleStudents();
        },
        { immediate: true },
    );

    watch(
        () => {
            const ev = input.loadedEvent.value;

            if (!ev) {
                return null;
            }

            const arr = readManagerEventStudentUserIds(ev);

            return [
                ev.id,
                sortManagerEventParticipantIds(arr).join(','),
            ] as const;
        },
        () => {
            resetStudentDraftFromEvent(input.loadedEvent.value);
        },
        { immediate: true },
    );

    watch([input.formStartLocal, input.formEndLocal], () => {
        const ev = input.loadedEvent.value;
        const id = input.eventId.value.trim();

        if (!id || !ev?.courseId?.trim() || !isManagerEventTheoryEvent(ev)) {
            return;
        }

        const startIso = input.localDatetimeToIso(input.formStartLocal.value);
        const endIso = input.localDatetimeToIso(input.formEndLocal.value);

        if (!startIso || !endIso) {
            return;
        }

        if (eligibleDebounceTimer) {
            clearTimeout(eligibleDebounceTimer);
        }

        eligibleDebounceTimer = setTimeout(async () => {
            const seq = ++eligibleSeq;

            try {
                const data = await input.fetchTheoryEventEligibleStudents(id, {
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

    onBeforeUnmount(() => {
        if (eligibleDebounceTimer) {
            clearTimeout(eligibleDebounceTimer);
        }
    });

    return {
        theoryStudentsError,
        theoryEligibleData,
        theoryEligibleError,
        isTheoryEligibleLoading,
        theoryEligibleNoCourse,
        theoryStudentsBaseline,
        draftTheoryStudentUserIds,
        theoryCapacitySummary,
        studentAttendanceKnown,
        isTheoryStudentsDirty,
        capacityForStudentPicker,
        sortedStudentIds: sortManagerEventParticipantIds,
        isTheoryRowChecked,
        isTheoryEligibleRowInteractive,
        handleToggleTheoryStudent,
        loadTheoryEligibleStudents,
        resetStudentDraftFromEvent,
        refreshEligibleForCurrentTime,
    };
}
