import type { CourseKind } from '~/types/course';

/**
 * Kontekst rezerwacji lekcji z kalendarza slotów (GET …/availability/slots).
 */
export type LessonBookingLessonType = 'THEORY' | 'PRACTICE';

/** Opcja instruktora w oknie czasu (profil instruktora). */
export interface LessonBookingInstructorOption {
    id: string;
    firstName: string;
    lastName: string;
}

/** Jedno okno czasu po zagregowaniu wielu instruktorów (widok kalendarza). */
export interface LessonBookingAggregatedSlot {
    date: string;
    startTime: string;
    endTime: string;
    instructorCount: number;
    availableInstructors: LessonBookingInstructorOption[];
}

export interface LessonBookingSlotContext {
    /** YYYY-MM-DD */
    date: string;
    /** HH:mm */
    startTime: string;
    /** HH:mm */
    endTime: string;
    schoolId: string;
    /** Instruktorzy dostępni w tym przedziale — wybór w modalu (min. 1). */
    availableInstructors: LessonBookingInstructorOption[];
}

/** Kurs kursanta z dopasowanym rodzajem kursu z listy szkoły. */
export interface StudentCourseWithKind {
    id: string;
    name: string;
    category: string;
    status: string;
    kind: CourseKind | null;
}

/** Body POST /lessons (BFF → BE). */
export interface CreateLessonBody {
    courseId: string;
    /** User.id kursanta (nie StudentProfile.id). */
    studentId: string;
    /** InstructorProfile.id */
    instructorId: string;
    startTime: string;
    endTime: string;
    lessonType: LessonBookingLessonType;
    /** Wymagane gdy lessonType === PRACTICE */
    vehicleId?: string;
}
