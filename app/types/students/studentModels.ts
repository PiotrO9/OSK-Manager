/** Rekord uczestnictwa (POST /students/:userId/courses) — pole `data.participant`. */
export interface CourseParticipantDto {
    id: string;
    courseId: string;
    studentId: string;
    createdAt: string;
}

/** Element listy kursantów (GET /students) — zgodnie z students-api.md (BE). */
export interface StudentListItem {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    pkkNumber: string | null;
    isActive: boolean;
    createdAt: string;
}

/** Paginowana strona listy kursantów (po normalizacji). */
export interface StudentListPage {
    items: StudentListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/** Kurs w szczegółach kursanta (GET /students/:userId) — status z course_participants. */
export interface StudentCourseItem {
    id: string;
    name: string;
    category: string;
    status: string;
}

/** Szczegóły kursanta z listą kursów w OSK. */
export interface StudentDetail {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    pkkNumber: string | null;
    /** Notatka globalna dla kursanta (student_profiles.notes). */
    notes: string | null;
    courses: StudentCourseItem[];
}

export interface StudentProcessStatusStep {
    name: string;
    completed: boolean;
    description: string;
}

export interface StudentProcessStatus {
    steps: StudentProcessStatusStep[];
}
