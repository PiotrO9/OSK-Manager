import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import {
    normalizeStudentListPage,
    type CourseParticipantDto,
    type StudentListPage,
} from '~/types/student';

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
    const studentId =
        typeof p.studentId === 'string' ? p.studentId.trim() : '';
    const createdAt =
        typeof p.createdAt === 'string' ? p.createdAt.trim() : '';

    if (!id || !courseId || !studentId || !createdAt) {
        return null;
    }

    return { id, courseId, studentId, createdAt };
}

export function useStudentsApi() {
    const _schoolId = ref<string | null>(null);
    const _page = ref(1);
    const _limit = ref(20);
    const _courseId = ref<string | null>(null);

    const listUrl = () => {
        const id = _schoolId.value?.trim();

        if (!id) {
            return '';
        }

        const qs = new URLSearchParams({
            schoolId: id,
            page: String(_page.value),
            limit: String(_limit.value),
        });

        const cid = _courseId.value?.trim();

        if (cid) {
            qs.set('courseId', cid);
        }

        return resolveBffEndpoint(`/api/students?${qs.toString()}`);
    };

    const {
        execute: _execList,
        isLoading: isListLoading,
        error: listError,
    } = useApi<unknown>('GET', listUrl);

    async function fetchList(
        params: StudentsListQuery,
    ): Promise<StudentListPage> {
        _schoolId.value = params.schoolId.trim();
        _page.value = params.page;
        _limit.value = params.limit;

        const trimmedCourse = params.courseId?.trim();

        _courseId.value =
            trimmedCourse && trimmedCourse.length > 0 ? trimmedCourse : null;

        const raw = await _execList();

        if (raw === null) {
            const apiErr = listError.value;
            const message = getApiFetchErrorMessage(
                apiErr,
                'Nie udało się pobrać listy kursantów.',
            );
            const out = new Error(message) as Error & { statusCode?: number };

            if (
                apiErr !== null &&
                typeof apiErr === 'object' &&
                'statusCode' in apiErr
            ) {
                const code = (apiErr as { statusCode: unknown }).statusCode;

                if (typeof code === 'number') {
                    out.statusCode = code;
                }
            }

            throw out;
        }

        const data = unwrapApiSuccessData<unknown>(raw);
        const pageData = normalizeStudentListPage(data);

        if (!pageData) {
            throw new Error(
                'Nieprawidłowa odpowiedź serwera (lista kursantów).',
            );
        }

        return pageData;
    }

    async function assignToCourse(
        params: AssignStudentToCourseParams,
    ): Promise<CourseParticipantDto> {
        const userId = params.userId.trim();
        const courseId = params.courseId.trim();

        if (!userId || !courseId) {
            throw new Error('Brak identyfikatora kursanta lub kursu.');
        }

        try {
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(
                    `/api/students/${encodeURIComponent(userId)}/courses`,
                ),
                {
                    method: 'POST',
                    credentials: 'include',
                    body: { courseId },
                },
            );

            const data = unwrapApiSuccessData<unknown>(raw);
            const participant = normalizeCourseParticipant(data);

            if (!participant) {
                throw new Error('Nieprawidłowa odpowiedź serwera (zapis na kurs).');
            }

            return participant;
        } catch (err) {
            const message = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać kursanta na kurs.',
            );
            const out = new Error(message) as Error & { statusCode?: number };

            if (
                err !== null &&
                typeof err === 'object' &&
                'statusCode' in err
            ) {
                const code = (err as { statusCode: unknown }).statusCode;

                if (typeof code === 'number') {
                    out.statusCode = code;
                }
            }

            throw out;
        }
    }

    return {
        isListLoading,
        fetchList,
        assignToCourse,
    };
}
