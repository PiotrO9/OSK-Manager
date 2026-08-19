import {
    normalizeStudentListPage,
    normalizeStudentProcessStatus,
    type CourseParticipantDto,
    type StudentListPage,
    type StudentProcessStatus,
} from '~/types/students/student';

export interface StudentsListQuery {
    schoolId: string;
    page: number;
    limit: number;
    courseId?: string;
}

export interface AssignStudentToCourseParams {
    userId: string;
    courseId: string;
}

export interface StudentProcessStatusParams {
    userId: string;
    schoolId: string;
}

export interface UpdateStudentNotesParams {
    userId: string;
    notes: string | null;
}

interface StudentNotesPatchData {
    notes?: unknown;
}

function normalizeCourseParticipant(
    data: unknown,
): CourseParticipantDto | null {
    if (data === null || typeof data !== 'object') {
        return null;
    }

    const wrap = data as Record<string, unknown>;
    const raw = wrap.participant;

    if (raw === null || typeof raw !== 'object') {
        return null;
    }

    const p = raw as Record<string, unknown>;
    const id = typeof p.id === 'string' ? p.id.trim() : '';
    const courseId = typeof p.courseId === 'string' ? p.courseId.trim() : '';
    const studentId = typeof p.studentId === 'string' ? p.studentId.trim() : '';
    const createdAt = typeof p.createdAt === 'string' ? p.createdAt.trim() : '';

    if (!id || !courseId || !studentId || !createdAt) {
        return null;
    }

    return { id, courseId, studentId, createdAt };
}

function buildStudentsListPath(params: StudentsListQuery): string {
    const qs = new URLSearchParams({
        schoolId: params.schoolId.trim(),
        page: String(params.page),
        limit: String(params.limit),
    });

    const courseId = params.courseId?.trim();

    if (courseId) {
        qs.set('courseId', courseId);
    }

    return `/api/students?${qs.toString()}`;
}

function readNotesFromPatchData(data: unknown): string | null | undefined {
    if (data === null || typeof data !== 'object') {
        return undefined;
    }

    const record = data as Record<string, unknown>;

    if (!('notes' in record)) {
        return undefined;
    }

    const notes = record.notes;

    if (notes === null || notes === undefined) {
        return null;
    }

    const normalized = String(notes).trim();

    return normalized.length > 0 ? normalized : null;
}

export function useStudentsApi() {
    const isListLoading = ref(false);

    async function fetchList(
        params: StudentsListQuery,
    ): Promise<StudentListPage> {
        isListLoading.value = true;

        try {
            return await requestBffData<StudentListPage>(
                'GET',
                buildStudentsListPath(params),
                {
                    fallbackMessage: 'Nie udało się pobrać listy kursantów.',
                    invalidMessage:
                        'Nieprawidłowa odpowiedź serwera (lista kursantów).',
                    normalize: normalizeStudentListPage,
                },
            );
        } finally {
            isListLoading.value = false;
        }
    }

    async function assignToCourse(
        params: AssignStudentToCourseParams,
    ): Promise<CourseParticipantDto> {
        const userId = params.userId.trim();
        const courseId = params.courseId.trim();

        if (!userId || !courseId) {
            throw new Error('Brak identyfikatora kursanta lub kursu.');
        }

        return requestBffData<CourseParticipantDto>(
            'POST',
            `/api/students/${encodeURIComponent(userId)}/courses`,
            {
                body: { courseId },
                fallbackMessage: 'Nie udało się zapisać kursanta na kurs.',
                invalidMessage:
                    'Nieprawidłowa odpowiedź serwera (zapis na kurs).',
                normalize: normalizeCourseParticipant,
            },
        );
    }

    async function updateNotes(
        params: UpdateStudentNotesParams,
    ): Promise<string | null> {
        const userId = params.userId.trim();

        if (!userId) {
            throw new Error('Brak identyfikatora kursanta.');
        }

        const data = await requestBffData<StudentNotesPatchData>(
            'PATCH',
            `/api/students/${encodeURIComponent(userId)}`,
            {
                body: { notes: params.notes },
                fallbackMessage: 'Nie udało się zapisać notatki.',
            },
        );

        const saved = readNotesFromPatchData(data);

        if (saved === undefined) {
            throw new Error(
                'Nieprawidłowa odpowiedź serwera po zapisie notatki.',
            );
        }

        return saved;
    }

    async function fetchProcessStatus(
        params: StudentProcessStatusParams,
    ): Promise<StudentProcessStatus> {
        const userId = params.userId.trim();
        const schoolId = params.schoolId.trim();

        if (!userId || !schoolId) {
            throw new Error('Brak identyfikatora kursanta lub szkoły.');
        }

        const qs = new URLSearchParams({ schoolId });

        return requestBffData<StudentProcessStatus>(
            'GET',
            `/api/students/${encodeURIComponent(userId)}/process-status?${qs.toString()}`,
            {
                fallbackMessage:
                    'Nie udało się pobrać statusu procesu kursanta.',
                invalidMessage:
                    'Nieprawidłowa odpowiedź serwera (status procesu kursanta).',
                normalize: normalizeStudentProcessStatus,
            },
        );
    }

    return {
        isListLoading: readonly(isListLoading),
        fetchList,
        assignToCourse,
        updateNotes,
        fetchProcessStatus,
    };
}
