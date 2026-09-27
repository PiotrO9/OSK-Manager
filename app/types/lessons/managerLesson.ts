import type { InstructorListItem } from '~/types/instructors/instructor';
import type { Vehicle } from '~/types/vehicles/vehicle';

/** Lekcja z GET/PATCH /lessons/:id (BFF → upstream). */
export interface AssignedCourseInstructor {
    id: string;
    name: string;
}

export interface ManagerLessonDetail {
    id: string;
    courseId: string;
    schoolId?: string;
    studentId: string;
    /** User.id używany przez GET /students/:userId; różny od StudentProfile.id. */
    studentUserId?: string;
    instructorId: string;
    vehicleId: string | null;
    lessonType: string;
    startTime: string;
    endTime: string;
    status: string;
    /** Gdy BE zwraca zagnieżdżonego kursanta (opcjonalnie). */
    student?: { firstName: string; lastName: string };
    /**
     * Zagnieżdżony instruktor z GET/PATCH — unika osobnego GET /instructors/:id przy edycji.
     */
    lessonInstructor?: InstructorListItem;
    /**
     * Zagnieżdżony pojazd z GET/PATCH — unika osobnego GET /vehicles/:id przy edycji.
     */
    lessonVehicle?: Vehicle;
    /** Instruktor przypisany do kursu; id to InstructorProfile.id. */
    assignedCourseInstructor?: AssignedCourseInstructor | null;
    bookingMaxDaysAhead?: number;
    schoolWorkingDaysMask?: number;
}

export interface PatchManagerLessonPayload {
    startTime?: string;
    endTime?: string;
    vehicleId?: string;
    instructorId?: string;
}
