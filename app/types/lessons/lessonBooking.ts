import type { CourseKind } from '~/types/courses/course';

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
    /** Instruktor ustalony przez wejście z jego własnego kalendarza. */
    fixedInstructor?: LessonBookingInstructorOption;
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

export interface LessonBookingEligibleStudent {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    courses: StudentCourseWithKind[];
}

export interface LessonBookingOptionsPage {
    items: LessonBookingEligibleStudent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Body POST /lessons (BFF → BE).
 * Rezerwacja z slotu kalendarza jest zawsze dla jednego kursanta — tylko jazda praktyczna
 * (teoria jest grupowa i nie przechodzi przez ten przepływ).
 */
export interface CreateLessonBody {
    courseId: string;
    /** User.id kursanta (nie StudentProfile.id). */
    studentId: string;
    /** InstructorProfile.id */
    instructorId: string;
    startTime: string;
    endTime: string;
    lessonType: 'PRACTICE';
    vehicleId: string;
}

export interface CreateOwnLessonBody {
    courseId: string;
    /** InstructorProfile.id */
    instructorId: string;
    startTime: string;
    endTime: string;
    bookingMode?: 'REMAINING_PACKAGE';
}

export interface LessonCreateResult {
    id: string;
    courseId: string;
    studentId: string;
    instructorId: string;
    vehicleId: string | null;
    lessonType: string;
    startTime: string;
    endTime: string;
    status: string;
    createdAt: string;
}
