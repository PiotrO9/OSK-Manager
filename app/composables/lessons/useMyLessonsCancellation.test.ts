import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, readonly, ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

function installVueGlobals(options: {
    cancelOwnLesson?: (lessonId: string) => Promise<unknown>;
    isCancelling?: boolean;
    addToast?: (toast: Record<string, unknown>) => void;
}): void {
    const cancelling = ref(options.isCancelling ?? false);

    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('useStudentLessonCancellationApi', () => ({
        cancelOwnLesson:
            options.cancelOwnLesson ?? vi.fn().mockResolvedValue({}),
        isCancelling: readonly(cancelling),
    }));
    vi.stubGlobal('useAppToast', () => ({
        addToast: options.addToast ?? vi.fn(),
    }));
}

function lesson(
    overrides: Partial<ScheduleLessonItem> = {},
): ScheduleLessonItem {
    return {
        id: 'lesson-1',
        kind: 'lesson',
        type: 'PRACTICE',
        status: 'SCHEDULED',
        startTime: '2026-08-16T10:00:00.000Z',
        endTime: '2026-08-16T11:00:00.000Z',
        ...overrides,
    };
}

describe('useMyLessonsCancellation', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    it('opens cancel dialog only for student scheduled practice lessons', async () => {
        installVueGlobals({});
        const { useMyLessonsCancellation } =
            await import('./useMyLessonsCancellation');
        const cancellation = useMyLessonsCancellation({
            isStudent: computed(() => true),
            loadWeek: vi.fn(),
        });

        cancellation.handleCancelLessonRequested(lesson());

        expect(cancellation.isCancelDialogOpen.value).toBe(true);
        expect(cancellation.pendingCancelLessonLabel.value).toContain('16.08');

        cancellation.clearPendingCancelLesson();
        cancellation.handleCancelLessonRequested(
            lesson({ status: 'COMPLETED' }),
        );

        expect(cancellation.isCancelDialogOpen.value).toBe(false);
    });

    it('ignores cancel requests for non-students', async () => {
        installVueGlobals({});
        const { useMyLessonsCancellation } =
            await import('./useMyLessonsCancellation');
        const cancellation = useMyLessonsCancellation({
            isStudent: computed(() => false),
            loadWeek: vi.fn(),
        });

        cancellation.handleCancelLessonRequested(lesson());

        expect(cancellation.isCancelDialogOpen.value).toBe(false);
    });

    it('cancels selected lesson, closes dialog, reloads week and emits success toast', async () => {
        const cancelOwnLesson = vi.fn().mockResolvedValue({});
        const addToast = vi.fn();
        const loadWeek = vi.fn().mockResolvedValue(undefined);

        installVueGlobals({ cancelOwnLesson, addToast });
        const { useMyLessonsCancellation } =
            await import('./useMyLessonsCancellation');
        const cancellation = useMyLessonsCancellation({
            isStudent: computed(() => true),
            loadWeek,
        });

        cancellation.handleCancelLessonRequested(lesson());
        await cancellation.handleConfirmCancelLesson();

        expect(cancelOwnLesson).toHaveBeenCalledWith('lesson-1');
        expect(cancellation.isCancelDialogOpen.value).toBe(false);
        expect(loadWeek).toHaveBeenCalledOnce();
        expect(addToast).toHaveBeenCalledWith({
            title: 'Rezerwacja zostala anulowana',
            variant: 'success',
        });
    });

    it('keeps dialog open and emits error toast when cancellation fails', async () => {
        const cancelOwnLesson = vi
            .fn()
            .mockRejectedValue({ data: { message: 'Cancel rejected' } });
        const addToast = vi.fn();
        const loadWeek = vi.fn();

        installVueGlobals({ cancelOwnLesson, addToast });
        const { useMyLessonsCancellation } =
            await import('./useMyLessonsCancellation');
        const cancellation = useMyLessonsCancellation({
            isStudent: computed(() => true),
            loadWeek,
        });

        cancellation.handleCancelLessonRequested(lesson());
        await cancellation.handleConfirmCancelLesson();

        expect(cancellation.isCancelDialogOpen.value).toBe(true);
        expect(loadWeek).not.toHaveBeenCalled();
        expect(addToast).toHaveBeenCalledWith({
            title: 'Nie udało się anulować rezerwacji',
            description: 'Cancel rejected',
            variant: 'error',
        });
    });
});
