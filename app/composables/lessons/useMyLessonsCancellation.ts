import type { ComputedRef } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

interface UseMyLessonsCancellationInput {
    isStudent: ComputedRef<boolean>;
    loadWeek: () => Promise<void>;
}

export function useMyLessonsCancellation(input: UseMyLessonsCancellationInput) {
    const { cancelOwnLesson, isCancelling } = useStudentLessonCancellationApi();
    const { addToast } = useAppToast();

    const pendingCancelLesson = ref<ScheduleLessonItem | null>(null);

    const cancellingLessonId = computed(() =>
        isCancelling.value ? (pendingCancelLesson.value?.id ?? null) : null,
    );

    const isCancelDialogOpen = computed({
        get: () => pendingCancelLesson.value !== null,
        set: (open: boolean) => {
            if (!open && !isCancelling.value) {
                pendingCancelLesson.value = null;
            }
        },
    });

    const pendingCancelLessonLabel = computed(() =>
        pendingCancelLesson.value
            ? formatLessonTimeRange(pendingCancelLesson.value)
            : '',
    );

    function handleCancelLessonRequested(lesson: ScheduleLessonItem): void {
        if (!input.isStudent.value || !isScheduledPracticeLesson(lesson)) {
            return;
        }

        pendingCancelLesson.value = lesson;
    }

    function handleCancelDialogOpenChange(open: boolean): void {
        isCancelDialogOpen.value = open;
    }

    async function handleConfirmCancelLesson(): Promise<void> {
        const lesson = pendingCancelLesson.value;

        if (!lesson || isCancelling.value) {
            return;
        }

        try {
            await cancelOwnLesson(lesson.id);
            pendingCancelLesson.value = null;

            addToast({
                title: 'Rezerwacja zostala anulowana',
                variant: 'success',
            });

            await input.loadWeek();
        } catch (err: unknown) {
            const message = getApiFetchErrorMessage(
                err,
                'Nie udało się anulować rezerwacji.',
            );

            addToast({
                title: 'Nie udało się anulować rezerwacji',
                description: message,
                variant: 'error',
            });
        }
    }

    function clearPendingCancelLesson(): void {
        pendingCancelLesson.value = null;
    }

    return {
        cancellingLessonId,
        clearPendingCancelLesson,
        handleCancelDialogOpenChange,
        handleCancelLessonRequested,
        handleConfirmCancelLesson,
        isCancelDialogOpen,
        isCancelling,
        pendingCancelLessonLabel,
    };
}

function isScheduledPracticeLesson(lesson: ScheduleLessonItem): boolean {
    return (
        lesson.kind === 'lesson' &&
        lesson.type.trim().toUpperCase() === 'PRACTICE' &&
        lesson.status.trim().toUpperCase() === 'SCHEDULED'
    );
}

function formatIsoLocal(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(d);
}

function formatLessonTimeRange(lesson: ScheduleLessonItem): string {
    return `${formatIsoLocal(lesson.startTime)} - ${formatIsoLocal(lesson.endTime)}`;
}
