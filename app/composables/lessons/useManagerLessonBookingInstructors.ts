import { computed, type Ref } from 'vue';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type {
    LessonBookingInstructorOption,
    LessonBookingSlotContext,
    StudentCourseWithKind,
} from '~/types/lessons/lessonBooking';
import type {
    LessonCreateAvailabilityRequest,
    ScheduleAvailabilityIssue,
    ScheduleAvailabilityResult,
} from '~/types/schedule/scheduleAvailability';
import { scheduleAvailabilityIssueMessage } from '~/types/schedule/scheduleAvailability';
import { useDebouncedAbortableRequest } from '~/composables/schedule/useDebouncedAbortableRequest';
import { filterManagerLessonBookingQualifiedInstructors } from '~/utils/lessons/managerLessonBookingDialog';

interface InstructorOptionsCandidate {
    booking: Omit<LessonCreateAvailabilityRequest, 'instructorId'>;
    instructors: LessonBookingInstructorOption[];
}

interface InstructorOptionsResult {
    instructors: LessonBookingInstructorOption[];
    issues: ScheduleAvailabilityIssue[];
}

export function useManagerLessonBookingInstructors(options: {
    open: Readonly<Ref<boolean>>;
    slotCtx: Readonly<Ref<LessonBookingSlotContext | null>>;
    selectedCourse: Readonly<Ref<StudentCourseWithKind | null>>;
    studentId: Readonly<Ref<string>>;
    vehicleId: Readonly<Ref<string>>;
    schoolInstructors: Readonly<Ref<readonly InstructorListItem[]>>;
}) {
    const candidate = computed<InstructorOptionsCandidate | null>(() => {
        const ctx = options.slotCtx.value;
        const course = options.selectedCourse.value;
        const studentId = options.studentId.value.trim();
        const vehicleId = options.vehicleId.value.trim();

        if (
            !options.open.value ||
            !ctx ||
            ctx.fixedInstructor ||
            !course ||
            !studentId ||
            !vehicleId
        )
            return null;

        return {
            booking: {
                intent: 'lesson_create',
                courseId: course.id,
                studentId,
                vehicleId,
                date: ctx.date,
                startTime: ctx.startTime,
                endTime: ctx.endTime,
            },
            // School calendar bookings allow choosing any eligible instructor.
            instructors: filterManagerLessonBookingQualifiedInstructors({
                selectedCourse: course,
                schoolInstructors: options.schoolInstructors.value,
            }),
        };
    });
    const request = useDebouncedAbortableRequest<
        InstructorOptionsCandidate,
        InstructorOptionsResult
    >({
        candidate,
        debounceMs: 150,
        fetcher: async ({ booking, instructors }, signal) => {
            const result: InstructorOptionsResult = {
                instructors: [],
                issues: [],
            };

            // Use the same rules as the final preflight, with bounded concurrency.
            for (let offset = 0; offset < instructors.length; offset += 4) {
                signal.throwIfAborted();
                const batch = instructors.slice(offset, offset + 4);
                const checks = await Promise.all(
                    batch.map((instructor) =>
                        requestBffData<ScheduleAvailabilityResult>(
                            'POST',
                            '/api/schedule/availability-check',
                            {
                                body: {
                                    ...booking,
                                    instructorId: instructor.id,
                                },
                                signal,
                                fallbackMessage:
                                    'Nie udało się pobrać dostępnych instruktorów.',
                            },
                        ),
                    ),
                );

                checks.forEach((check, index) => {
                    if (check.available) result.instructors.push(batch[index]!);
                    else
                        result.issues.push(
                            ...check.issues.filter(
                                (issue) => issue.field !== 'instructorId',
                            ),
                        );
                });
            }

            return result;
        },
    });
    const instructors = computed(() => [
        ...(request.result.value?.instructors ?? []),
    ]);
    const message = computed(() => {
        if (request.status.value === 'idle')
            return 'Wybierz kursanta, kurs i pojazd, aby zobaczyć dostępnych instruktorów.';

        if (request.status.value === 'loading')
            return 'Sprawdzanie dostępnych instruktorów…';

        if (request.status.value === 'error')
            return 'Nie udało się sprawdzić instruktorów. Spróbuj ponownie.';

        if (instructors.value.length > 0) return '';

        const issue = request.result.value?.issues[0];

        return issue
            ? scheduleAvailabilityIssueMessage(issue)
            : 'Brak wolnych instruktorów z uprawnieniami do tej kategorii w wybranym terminie.';
    });

    return {
        instructors,
        status: request.status,
        message,
        reload: request.execute,
    };
}
