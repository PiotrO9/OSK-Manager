import type { Ref } from 'vue';
import {
    normalizeCourseDetailData,
    normalizeCoursesList,
    normalizeMyCoursesList,
    type CourseCreatePayload,
    type CourseDetail,
    type CourseListItem,
    type CurrentUserCourseItem,
    type CoursePatchInstructorPayload,
} from '~/types/courses/course';
import { requestBffData } from '../core/useApi';

export function useCoursesApi() {
    const isListLoading = ref(false);
    const isMyCoursesLoading = ref(false);
    const isDetailLoading = ref(false);
    const isCreateLoading = ref(false);
    const isPatchLoading = ref(false);

    async function runWithLoading<T>(
        loading: Ref<boolean>,
        request: () => Promise<T>,
    ): Promise<T> {
        loading.value = true;

        try {
            return await request();
        } finally {
            loading.value = false;
        }
    }

    async function fetchList(schoolId: string): Promise<CourseListItem[]> {
        const sid = schoolId.trim();
        const qs = new URLSearchParams({ schoolId: sid });

        return await runWithLoading(isListLoading, () =>
            requestBffData<CourseListItem[]>(
                'GET',
                `/api/courses?${qs.toString()}`,
                {
                    fallbackMessage: 'Nie udało się pobrać listy kursów.',
                    normalize: (data) => normalizeCoursesList(data),
                },
            ),
        );
    }

    async function fetchMyCourses(): Promise<CurrentUserCourseItem[]> {
        return await runWithLoading(isMyCoursesLoading, () =>
            requestBffData<CurrentUserCourseItem[]>('GET', '/api/me/courses', {
                fallbackMessage: 'Nie udało się pobrać listy kursów.',
                normalize: (data) => normalizeMyCoursesList(data),
            }),
        );
    }

    async function fetchById(courseId: string): Promise<CourseDetail> {
        const id = courseId.trim();

        return await runWithLoading(isDetailLoading, () =>
            requestBffData<CourseDetail>(
                'GET',
                `/api/courses/${encodeURIComponent(id)}`,
                {
                    fallbackMessage: 'Nie udało się pobrać szczegółów kursu.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera (kurs).',
                    normalize: (data) => normalizeCourseDetailData(data),
                },
            ),
        );
    }

    async function createCourse(
        body: CourseCreatePayload,
    ): Promise<CourseDetail> {
        return await runWithLoading(isCreateLoading, () =>
            requestBffData<CourseDetail>('POST', '/api/courses', {
                body,
                fallbackMessage: 'Nie udało się utworzyć kursu.',
                invalidMessage:
                    'Nieprawidłowa odpowiedź serwera (utworzony kurs).',
                normalize: (data) => normalizeCourseDetailData(data),
            }),
        );
    }

    async function patchCourse(
        courseId: string,
        body: CoursePatchInstructorPayload,
    ): Promise<CourseDetail> {
        const id = courseId.trim();

        return await runWithLoading(isPatchLoading, () =>
            requestBffData<CourseDetail>(
                'PATCH',
                `/api/courses/${encodeURIComponent(id)}`,
                {
                    body,
                    fallbackMessage:
                        'Nie udało się zaktualizować instruktora kursu.',
                    invalidMessage:
                        'Nieprawidłowa odpowiedź serwera (kurs po PATCH).',
                    normalize: (data) => normalizeCourseDetailData(data),
                },
            ),
        );
    }

    return {
        isListLoading: readonly(isListLoading),
        isMyCoursesLoading: readonly(isMyCoursesLoading),
        isDetailLoading: readonly(isDetailLoading),
        isCreateLoading: readonly(isCreateLoading),
        isPatchLoading: readonly(isPatchLoading),
        fetchMyCourses,
        fetchList,
        fetchById,
        createCourse,
        patchCourse,
    };
}
