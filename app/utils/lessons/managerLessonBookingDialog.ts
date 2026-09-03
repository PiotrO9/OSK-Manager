import type { InstructorListItem } from '~/types/instructors/instructor';
import type {
    CreateLessonBody,
    LessonBookingInstructorOption,
    LessonBookingSlotContext,
    StudentCourseWithKind,
} from '~/types/lessons/lessonBooking';
import { buildSlotIsoUTC } from '~/utils/date/weeklyCalendarDates';

function managerLessonBookingInstructorHasCategoryQualification(
    instructor: InstructorListItem,
    categoryCode: string,
): boolean {
    const code = categoryCode.trim();

    if (!code) {
        return false;
    }

    return (instructor.qualifiedCourseTypes ?? []).some(
        (courseType) => courseType.code.trim() === code,
    );
}

export function filterManagerLessonBookingCourses(
    courses: readonly StudentCourseWithKind[],
): StudentCourseWithKind[] {
    return courses.filter((course) => {
        if (course.kind === null) {
            return true;
        }

        return course.kind === 'PRACTICAL' || course.kind === 'EXTRA';
    });
}

export function filterManagerLessonBookingAvailableInstructors(params: {
    slotCtx: LessonBookingSlotContext | null;
    selectedCourse: StudentCourseWithKind | null;
    schoolInstructors: readonly InstructorListItem[];
}): LessonBookingInstructorOption[] {
    const { slotCtx, selectedCourse, schoolInstructors } = params;

    if (!slotCtx) {
        return [];
    }

    if (!selectedCourse) {
        return slotCtx.availableInstructors;
    }

    const qualifiedIds = new Set(
        schoolInstructors
            .filter((instructor) =>
                managerLessonBookingInstructorHasCategoryQualification(
                    instructor,
                    selectedCourse.category,
                ),
            )
            .map((instructor) => instructor.id),
    );

    return slotCtx.availableInstructors.filter((instructor) =>
        qualifiedIds.has(instructor.id),
    );
}

export function formatManagerLessonBookingSlotWhenLabel(
    slotCtx: LessonBookingSlotContext | null,
): string {
    if (!slotCtx) {
        return '';
    }

    const date = new Date(`${slotCtx.date}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
        return `${slotCtx.date}, ${slotCtx.startTime}–${slotCtx.endTime}`;
    }

    const dateStr = date.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return `${dateStr}, ${slotCtx.startTime}–${slotCtx.endTime}`;
}

export function readManagerLessonBookingFetchStatusCode(
    err: unknown,
): number | undefined {
    if (err !== null && typeof err === 'object' && 'statusCode' in err) {
        const code = (err as { statusCode: unknown }).statusCode;

        if (typeof code === 'number') {
            return code;
        }
    }

    return undefined;
}

export function buildManagerLessonBookingSubmitBody(params: {
    slotCtx: LessonBookingSlotContext | null;
    studentUserId: string;
    courseId: string;
    instructorId: string;
    vehicleId: string;
}): { ok: true; body: CreateLessonBody } | { ok: false; error: string } {
    const ctx = params.slotCtx;

    if (!ctx) {
        return { ok: false, error: 'Brak kontekstu slotu.' };
    }

    const studentUserId = params.studentUserId.trim();
    const courseId = params.courseId.trim();
    const instructorId = params.instructorId.trim();
    const vehicleId = params.vehicleId.trim();

    if (!studentUserId) {
        return { ok: false, error: 'Wybierz kursanta.' };
    }

    if (!courseId) {
        return { ok: false, error: 'Wybierz kurs.' };
    }

    if (!instructorId) {
        return { ok: false, error: 'Wybierz instruktora.' };
    }

    if (!vehicleId) {
        return {
            ok: false,
            error: 'Wybierz pojazd dla jazdy praktycznej.',
        };
    }

    return {
        ok: true,
        body: {
            courseId,
            studentId: studentUserId,
            instructorId,
            startTime: buildSlotIsoUTC(ctx.date, ctx.startTime),
            endTime: buildSlotIsoUTC(ctx.date, ctx.endTime),
            lessonType: 'PRACTICE',
            vehicleId,
        },
    };
}
