import type { InstructorListItem } from './instructor';
import type { Vehicle } from './vehicle';

/** Lekcja z GET/PATCH /lessons/:id (BFF → upstream). */
export interface ManagerLessonDetail {
    id: string;
    courseId: string;
    studentId: string;
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
}

export interface PatchManagerLessonPayload {
    startTime?: string;
    endTime?: string;
    vehicleId?: string;
    instructorId?: string;
}
