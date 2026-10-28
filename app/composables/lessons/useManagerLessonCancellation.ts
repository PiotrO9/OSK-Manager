import { computed, shallowRef, type Ref } from 'vue';
import { appPaths } from '~~/shared/routing/appPaths';
import type { AddToastInput } from '~/types/toast';
import type { ManagerLessonDetail } from '~/types/lessons/managerLesson';
import { isManagerLessonCancellable } from '~/utils/lessons/managerLessonEditability';
import { managerLessonCancelErrorMessage } from '~/utils/lessons/managerLessonEditErrorMessage';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import type { useManagerLessonsApi } from './useManagerLessonsApi';

interface CancellationInput {
    loadedLesson: Ref<ManagerLessonDetail | null>;
    isSaving: Readonly<Ref<boolean>>;
    isCancelLoading: Readonly<Ref<boolean>>;
    studentDisplayName: Readonly<Ref<string | null | undefined>>;
    fetchLesson: ReturnType<typeof useManagerLessonsApi>['fetchLesson'];
    cancelLesson: ReturnType<typeof useManagerLessonsApi>['cancelLesson'];
    addToast: (toast: AddToastInput) => unknown;
    navigateTo: (target: {
        path: string;
        query: Record<string, string>;
    }) => unknown;
}
export function useManagerLessonCancellation(input: CancellationInput) {
    const {
        loadedLesson,
        isSaving,
        isCancelLoading,
        studentDisplayName,
        fetchLesson,
        cancelLesson,
        addToast,
        navigateTo,
    } = input;
    const isCancelDialogOpen = shallowRef(false);
    const cancelError = shallowRef<string | null>(null);
    const canCancelLesson = computed(() =>
        loadedLesson.value
            ? isManagerLessonCancellable(
                  loadedLesson.value.status,
                  loadedLesson.value.startTime,
              )
            : false,
    );
    const cancelLessonLabel = computed(() => {
        const lesson = loadedLesson.value;

        if (!lesson) return '';

        const start = new Date(lesson.startTime);
        const end = new Date(lesson.endTime);
        const date = new Intl.DateTimeFormat('pl-PL', {
            dateStyle: 'full',
            timeZone: 'Europe/Warsaw',
        }).format(start);
        const time = new Intl.DateTimeFormat('pl-PL', {
            timeStyle: 'short',
            timeZone: 'Europe/Warsaw',
        });

        return `${studentDisplayName.value ?? 'Kursant'} · ${date}, ${time.format(start)}–${time.format(end)}`;
    });

    function handleRequestCancelLesson(): void {
        if (!canCancelLesson.value || isSaving.value || isCancelLoading.value) {
            return;
        }

        cancelError.value = null;
        isCancelDialogOpen.value = true;
    }

    async function handleConfirmCancelLesson(): Promise<void> {
        const lesson = loadedLesson.value;

        if (!lesson || !canCancelLesson.value || isCancelLoading.value) {
            return;
        }

        cancelError.value = null;

        try {
            await cancelLesson(lesson.id);
        } catch (err: unknown) {
            cancelError.value = managerLessonCancelErrorMessage(err);

            if ([400, 409].includes(getApiErrorStatusCode(err) ?? 0)) {
                try {
                    loadedLesson.value = await fetchLesson(lesson.id);

                    if (!canCancelLesson.value) {
                        cancelError.value =
                            'Ta jazda nie może już zostać anulowana. Wróć do harmonogramu, aby zobaczyć aktualny stan.';
                    }
                } catch {
                    // Zachowaj pierwotny błąd anulowania w dialogu.
                }
            }

            return;
        }

        isCancelDialogOpen.value = false;
        addToast({
            title: 'Anulowano rezerwację',
            description: 'Jazda została anulowana.',
            variant: 'success',
        });
        await navigateTo({
            path: appPaths.managerSchedule(),
            query: {
                ...(lesson.schoolId ? { schoolId: lesson.schoolId } : {}),
                week: lesson.startTime,
            },
        });
    }

    return {
        isCancelDialogOpen,
        cancelError,
        canCancelLesson,
        cancelLessonLabel,
        handleRequestCancelLesson,
        handleConfirmCancelLesson,
    };
}
