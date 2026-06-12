import type { MaybeRefOrGetter } from 'vue';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import {
    normalizeCourseDetailData,
    normalizeCoursesList,
    normalizeMyCoursesList,
    type CourseCreatePayload,
    type CourseDetail,
    type CourseListItem,
    type CurrentUserCourseItem,
    type CoursePatchInstructorPayload,
} from '~/types/course';

export function useCoursesApi() {
    const _schoolId = ref<string | null>(null);
    const _courseDetailId = ref<string | null>(null);
    const _patchCourseId = ref<string | null>(null);

    const myCoursesUrl = () => resolveBffEndpoint('/api/me/courses');

    const {
        execute: _execMyCourses,
        isLoading: isMyCoursesLoading,
        error: myCoursesError,
    } = useApi<unknown>('GET', myCoursesUrl);

    const listUrl = () => {
        const id = _schoolId.value;

        return id
            ? resolveBffEndpoint(
                  `/api/courses?schoolId=${encodeURIComponent(id)}`,
              )
            : '';
    };

    const {
        execute: _execList,
        isLoading: isListLoading,
        error: listError,
    } = useApi<unknown>('GET', listUrl);

    const detailUrl = () => {
        const id = _courseDetailId.value?.trim();

        return id
            ? resolveBffEndpoint(`/api/courses/${encodeURIComponent(id)}`)
            : '';
    };

    const {
        execute: _execDetail,
        isLoading: isDetailLoading,
        error: detailError,
    } = useApi<unknown>('GET', detailUrl);

    const createUrl = () => resolveBffEndpoint('/api/courses');
    const _createBody = ref<CourseCreatePayload | null>(null);

    const {
        execute: _execCreate,
        isLoading: isCreateLoading,
        error: createError,
    } = useApi<unknown>('POST', createUrl, {
        body: _createBody as MaybeRefOrGetter<unknown>,
    });

    const patchUrl = () => {
        const id = _patchCourseId.value?.trim();

        return id
            ? resolveBffEndpoint(`/api/courses/${encodeURIComponent(id)}`)
            : '';
    };

    const _patchBody = ref<CoursePatchInstructorPayload | null>(null);

    const {
        execute: _execPatch,
        isLoading: isPatchLoading,
        error: patchError,
    } = useApi<unknown>('PATCH', patchUrl, {
        body: _patchBody as MaybeRefOrGetter<unknown>,
    });

    async function fetchList(schoolId: string): Promise<CourseListItem[]> {
        _schoolId.value = schoolId;

        const raw = await _execList();

        if (raw === null) {
            const apiErr = listError.value;
            const message = getApiFetchErrorMessage(
                apiErr,
                'Nie udało się pobrać listy kursów.',
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

        return normalizeCoursesList(data);
    }

    async function fetchMyCourses(): Promise<CurrentUserCourseItem[]> {
        const raw = await _execMyCourses();

        if (raw === null) {
            throw new Error(
                getApiFetchErrorMessage(
                    myCoursesError.value,
                    'Nie udało się pobrać listy kursów.',
                ),
            );
        }

        const data = unwrapApiSuccessData<unknown>(raw);

        return normalizeMyCoursesList(data);
    }

    async function fetchById(courseId: string): Promise<CourseDetail> {
        _courseDetailId.value = courseId.trim();

        const raw = await _execDetail();

        if (raw === null) {
            const apiErr = detailError.value;
            const message = getApiFetchErrorMessage(
                apiErr,
                'Nie udało się pobrać szczegółów kursu.',
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
        const detail = normalizeCourseDetailData(data);

        if (!detail) {
            throw new Error('Nieprawidłowa odpowiedź serwera (kurs).');
        }

        return detail;
    }

    async function createCourse(
        body: CourseCreatePayload,
    ): Promise<CourseDetail> {
        _createBody.value = body;

        const raw = await _execCreate();

        if (raw === null) {
            throw new Error(
                getApiFetchErrorMessage(
                    createError.value,
                    'Nie udało się utworzyć kursu.',
                ),
            );
        }

        const data = unwrapApiSuccessData<unknown>(raw);
        const detail = normalizeCourseDetailData(data);

        if (!detail) {
            throw new Error(
                'Nieprawidłowa odpowiedź serwera (utworzony kurs).',
            );
        }

        return detail;
    }

    async function patchCourse(
        courseId: string,
        body: CoursePatchInstructorPayload,
    ): Promise<CourseDetail> {
        _patchCourseId.value = courseId.trim();
        _patchBody.value = body;

        const raw = await _execPatch();

        if (raw === null) {
            throw new Error(
                getApiFetchErrorMessage(
                    patchError.value,
                    'Nie udało się zaktualizować instruktora kursu.',
                ),
            );
        }

        const data = unwrapApiSuccessData<unknown>(raw);
        const detail = normalizeCourseDetailData(data);

        if (!detail) {
            throw new Error('Nieprawidłowa odpowiedź serwera (kurs po PATCH).');
        }

        return detail;
    }

    return {
        isListLoading,
        isMyCoursesLoading,
        isDetailLoading,
        isCreateLoading,
        isPatchLoading,
        fetchMyCourses,
        fetchList,
        fetchById,
        createCourse,
        patchCourse,
    };
}
