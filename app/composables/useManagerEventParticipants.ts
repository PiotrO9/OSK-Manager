import type { Ref } from 'vue';
import type {
    InstructorEvent,
    TheoryEventEligibleStudentRow,
    TheoryEventEligibleStudentsData,
} from '~/types/instructorEvent';
import type { StudentListItem } from '~/types/student';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

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
            remaining === null
                ? '---'
                : String(Math.max(0, Math.trunc(remaining)));

        return `Miejsca: ${used} / ${limit} (wolnych: ${rem})`;
    });

    const studentAttendanceKnown = computed(
        (): boolean => input.loadedEvent.value?.studentAttendanceKnown ?? false,
    );

    const isTheoryStudentsDirty = computed((): boolean => {
        const ev = input.loadedEvent.value;

        if (
            !ev ||
            String(ev.type ?? '')
                .trim()
                .toUpperCase() !== 'THEORY'
        ) {
            return false;
        }

        return (
            JSON.stringify(
                sortedStudentIds(draftTheoryStudentUserIds.value),
            ) !== JSON.stringify(theoryStudentsBaseline.value)
        );
    });

    const capacityForStudentPicker = computed((): number | null => {
        const parsed = input.parseCapacity(input.formCapacityInput.value);

        if (parsed === false) {
            return input.loadedEvent.value?.capacity ?? null;
        }

        if (parsed !== null) {
            return parsed;
        }

        return input.loadedEvent.value?.capacity ?? null;
    });

    async function loadTheoryEligibleStudents(): Promise<void> {
        theoryEligibleError.value = null;
        theoryEligibleData.value = null;
        theoryEligibleNoCourse.value = false;

        const id = input.eventId.value.trim();
        const ev = input.loadedEvent.value;

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

        const ids = ev.studentUserIds;
        const arr = Array.isArray(ids)
            ? ids.map((x) => String(x).trim()).filter(Boolean)
            : [];

        theoryStudentsBaseline.value = sortedStudentIds(arr);
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
        return row.isAssignedToEvent || row.canAssign;
    }

    function handleToggleTheoryStudent(
        s: StudentListItem,
        next: boolean,
    ): void {
        theoryStudentsError.value = null;

        const cap = capacityForStudentPicker.value;

        if (
            next &&
            cap !== null &&
            !isTheoryRowChecked(s) &&
            draftTheoryStudentUserIds.value.length >= Math.trunc(cap)
        ) {
            theoryStudentsError.value =
                'Osiągnięto limit miejsc - odznacz kogoś lub zwiększ limit w danych bloku.';

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

        draftTheoryStudentUserIds.value =
            draftTheoryStudentUserIds.value.filter(
                (id) => !draftIdBelongsToStudentRow(s, id),
            );
    }

    watch(
        () =>
            [
                input.loadedEvent.value?.id ?? '',
                String(input.loadedEvent.value?.type ?? '')
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

            const ids = ev.studentUserIds;
            const arr = Array.isArray(ids)
                ? ids.map((x) => String(x).trim()).filter(Boolean)
                : [];

            return [ev.id, sortedStudentIds(arr).join(',')] as const;
        },
        () => {
            resetStudentDraftFromEvent(input.loadedEvent.value);
        },
        { immediate: true },
    );

    watch([input.formStartLocal, input.formEndLocal], () => {
        const ev = input.loadedEvent.value;
        const id = input.eventId.value.trim();

        if (
            !id ||
            !ev?.courseId?.trim() ||
            String(ev.type ?? '')
                .trim()
                .toUpperCase() !== 'THEORY'
        ) {
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
        sortedStudentIds,
        isTheoryRowChecked,
        isTheoryEligibleRowInteractive,
        handleToggleTheoryStudent,
        loadTheoryEligibleStudents,
        resetStudentDraftFromEvent,
        refreshEligibleForCurrentTime,
    };
}
