import {
    buildStudentCoursePath,
    buildStudentPath,
    buildStudentProcessStatusPath,
    buildStudentsListPath,
    normalizeCourseParticipant,
    normalizeStudentListPage,
    normalizeStudentProcessStatus,
    readNotesFromPatchData,
    type AssignStudentToCourseParams,
    type CourseParticipantDto,
    type StudentListPage,
    type StudentNotesPatchData,
    type StudentProcessStatus,
    type StudentProcessStatusParams,
    type StudentsListQuery,
    type UpdateStudentNotesParams,
} from '~/utils/students/studentApiRequests';

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
            buildStudentCoursePath(userId),
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
            buildStudentPath(userId),
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

        return requestBffData<StudentProcessStatus>(
            'GET',
            buildStudentProcessStatusPath({ userId, schoolId }),
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
