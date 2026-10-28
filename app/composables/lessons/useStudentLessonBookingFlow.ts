import { shallowRef, type Ref } from 'vue';
import type { AddToastInput } from '~/types/toast';
import type { CurrentUserCourseItem } from '~/types/courses/course';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import { buildSlotIsoUTC } from '~/utils/date/weeklyCalendarDates';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import {
    canStudentBookSlotWithCourseHours,
    getStudentLessonBookingInstructorName,
} from '~/utils/student/studentLessonBookingPage';
import type { LessonSelfBookAvailabilityRequest } from '~/types/schedule/scheduleAvailability';
import { scheduleAvailabilityIssueMessage } from '~/types/schedule/scheduleAvailability';
import { formatStudentLessonBookingDateLabel } from '~/composables/student/lesson-booking/useStudentLessonBookingSlotList';
import type { useStudentLessonBookingApi } from './useStudentLessonBookingApi';

interface BookingFlowInput {
    selectedCourse: Readonly<Ref<CurrentUserCourseItem | null>>;
    bookOwnLesson: ReturnType<
        typeof useStudentLessonBookingApi
    >['bookOwnLesson'];
    addToast: (toast: AddToastInput) => unknown;
    loadCourses: () => Promise<void>;
    loadSlots: () => Promise<void>;
    getSlotKey: (slot: SchoolAvailabilitySlot) => string;
}
export function useStudentLessonBookingFlow(input: BookingFlowInput) {
    const { selectedCourse, bookOwnLesson, addToast, loadCourses, loadSlots } =
        input;
    const bookingFeedbackMessage = shallowRef<string | null>(null);
    const bookingFeedbackTone = shallowRef<'success' | 'error'>('success');
    const bookingSlotKey = shallowRef<string | null>(null);
    const pendingConfirmationSlot = shallowRef<SchoolAvailabilitySlot | null>(
        null,
    );
    const pendingShorterSlot = shallowRef<SchoolAvailabilitySlot | null>(null);
    const isConfirmDialogOpen = shallowRef(false);
    const availabilityCandidate =
        shallowRef<LessonSelfBookAvailabilityRequest | null>(null);
    const availability = useScheduleAvailabilityCheck({
        candidate: availabilityCandidate,
    });

    function clearBookingFeedback(): void {
        bookingFeedbackMessage.value = null;
    }

    function handleRequestBookSlot(slot: SchoolAvailabilitySlot): void {
        const course = selectedCourse.value;

        if (!course || bookingSlotKey.value !== null) {
            return;
        }

        if (!canStudentBookSlotWithCourseHours(course, slot)) {
            const message =
                'Ta jazda przekroczyłaby dostępny pakiet godzin na kursie.';

            bookingFeedbackMessage.value = message;
            bookingFeedbackTone.value = 'error';
            addToast({
                title: 'Brak wystarczających godzin',
                description: message,
                variant: 'error',
            });

            return;
        }

        pendingConfirmationSlot.value = slot;
        pendingShorterSlot.value = null;
        bookingFeedbackMessage.value = null;
        isConfirmDialogOpen.value = true;
    }

    function handleCloseConfirmDialog(): void {
        if (bookingSlotKey.value !== null) {
            return;
        }

        isConfirmDialogOpen.value = false;
        pendingConfirmationSlot.value = null;
        pendingShorterSlot.value = null;
        bookingFeedbackMessage.value = null;
    }

    async function handleConfirmBookSlot(): Promise<void> {
        const slot = pendingConfirmationSlot.value;

        if (!slot) {
            return;
        }

        if (await handleBookSlot(slot)) {
            isConfirmDialogOpen.value = false;
            pendingConfirmationSlot.value = null;
            pendingShorterSlot.value = null;
        }
    }

    async function handleConfirmShorterSlot(): Promise<void> {
        const slot = pendingShorterSlot.value;

        if (slot && (await handleBookSlot(slot, 'REMAINING_PACKAGE'))) {
            isConfirmDialogOpen.value = false;
            pendingConfirmationSlot.value = null;
            pendingShorterSlot.value = null;
        }
    }

    async function handleBookSlot(
        slot: SchoolAvailabilitySlot,
        bookingMode?: 'REMAINING_PACKAGE',
    ): Promise<boolean> {
        const course = selectedCourse.value;

        if (!course || bookingSlotKey.value !== null) {
            return false;
        }

        bookingSlotKey.value = input.getSlotKey(slot);
        bookingFeedbackMessage.value = null;
        availabilityCandidate.value = {
            intent: 'lesson_self_book',
            courseId: course.id,
            instructorId: slot.instructorId,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            bookingMode,
        };

        try {
            const availabilityStatus = await availability.recheck();

            if (availabilityStatus === 'unavailable') {
                const alternative = availability.result.value?.alternative;

                if (!bookingMode && alternative) {
                    pendingShorterSlot.value = {
                        ...slot,
                        startTime: alternative.startTime,
                        endTime: alternative.endTime,
                    };
                    bookingFeedbackMessage.value = `Pełna jazda przekroczy pakiet. Pozostało ${alternative.durationMinutes} min. Możesz zarezerwować ten krótszy termin.`;
                    bookingFeedbackTone.value = 'error';

                    return false;
                }

                const firstIssue = availability.result.value?.issues[0];
                const remainingMinutes =
                    availability.result.value?.remainingMinutes;
                const message =
                    (firstIssue?.code === 'COURSE_LIMIT_EXCEEDED' &&
                    remainingMinutes !== undefined
                        ? `Saldo pakietu się zmieniło. Pozostało ${remainingMinutes} min.`
                        : firstIssue
                          ? scheduleAvailabilityIssueMessage(firstIssue)
                          : null) ||
                    availability.message.value ||
                    'Wybrany termin nie jest już dostępny.';

                bookingFeedbackMessage.value = message;
                bookingFeedbackTone.value = 'error';
                addToast({
                    title: 'Termin jest niedostępny',
                    description: message,
                    variant: 'error',
                });
                await loadSlots();

                return false;
            }

            if (
                availabilityStatus !== 'available' &&
                availabilityStatus !== 'error'
            ) {
                const message =
                    'Nie udało się potwierdzić dostępności terminu. Spróbuj ponownie.';

                bookingFeedbackMessage.value = message;
                bookingFeedbackTone.value = 'error';
                addToast({
                    title: 'Sprawdź termin ponownie',
                    description: message,
                    variant: 'error',
                });

                return false;
            }

            await bookOwnLesson({
                courseId: course.id,
                instructorId: slot.instructorId,
                startTime: buildSlotIsoUTC(slot.date, slot.startTime),
                endTime: buildSlotIsoUTC(slot.date, slot.endTime),
                bookingMode,
            });

            const successText = `Zarezerwowano jazdę: ${formatStudentLessonBookingDateLabel(slot.date)}, ${slot.startTime}–${slot.endTime}, ${getStudentLessonBookingInstructorName(slot)}.`;

            bookingFeedbackMessage.value = null;
            bookingFeedbackTone.value = 'success';
            addToast({
                title: successText,
                variant: 'success',
            });
            await loadCourses();

            return true;
        } catch (err: unknown) {
            const isConflict = getApiErrorStatusCode(err) === 409;

            if (isConflict && bookingMode) {
                await availability.recheck();
                const remainingMinutes =
                    availability.result.value?.remainingMinutes;

                pendingShorterSlot.value = null;
                bookingFeedbackMessage.value =
                    remainingMinutes === undefined
                        ? 'Saldo pakietu lub dostępność terminu się zmieniły. Sprawdź termin ponownie.'
                        : `Saldo pakietu się zmieniło. Pozostało ${remainingMinutes} min. Sprawdź termin ponownie.`;
                bookingFeedbackTone.value = 'error';

                return false;
            }

            if (isConflict && !bookingMode) {
                const refreshedStatus = await availability.recheck();
                const alternative =
                    refreshedStatus === 'unavailable'
                        ? availability.result.value?.alternative
                        : null;

                if (alternative) {
                    pendingShorterSlot.value = {
                        ...slot,
                        startTime: alternative.startTime,
                        endTime: alternative.endTime,
                    };
                    bookingFeedbackMessage.value = `Saldo pakietu się zmieniło. Pozostało ${alternative.durationMinutes} min. Możesz zarezerwować krótszy termin.`;
                    bookingFeedbackTone.value = 'error';

                    return false;
                }
            }

            const message = isConflict
                ? 'Ten termin został właśnie zajęty. Lista terminów została odświeżona.'
                : getApiFetchErrorMessage(
                      err,
                      'Nie udało się zarezerwować jazdy.',
                  );

            bookingFeedbackMessage.value = message;
            bookingFeedbackTone.value = 'error';
            addToast({
                title: 'Nie udało się zarezerwować jazdy',
                description: message,
                variant: 'error',
            });

            if (isConflict) {
                await loadSlots();
            }

            return false;
        } finally {
            availabilityCandidate.value = null;
            bookingSlotKey.value = null;
        }
    }

    return {
        bookingFeedbackMessage,
        bookingFeedbackTone,
        bookingSlotKey,
        pendingConfirmationSlot,
        pendingShorterSlot,
        isConfirmDialogOpen,
        handleRequestBookSlot,
        handleCloseConfirmDialog,
        handleConfirmBookSlot,
        handleConfirmShorterSlot,
        clearBookingFeedback,
    };
}
