import type { CourseTypeOption } from '~/types/courses/courseType';

export interface InstructorListItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    qualifiedCourseTypes?: CourseTypeOption[];
    /** Konto użytkownika (GET kursu zwraca `instructor.id` jako User.id). */
    userId?: string;
    /** GET /events/:id, GET /lessons/:id — gdy BE zwraca kontakt. */
    phone?: string | null;
}

export interface InstructorDetail {
    id: string;
    name: string;
    email: string;
    licenseNumber: string;
    phone: string;
    qualifications: string;
    qualifiedCourseTypes: CourseTypeOption[];
    experience: string;
}

/** Pola formularza edycji (bez placeholderów wyświetlania). */
export interface InstructorEditFormModel {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    qualifications: string;
    qualifiedCourseTypeIds: string[];
    experienceYears: number;
}
