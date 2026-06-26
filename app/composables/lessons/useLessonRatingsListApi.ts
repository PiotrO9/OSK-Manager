import {
    normalizeInstructorOwnLessonRatingsPayload,
    normalizeLessonRatingsListPayload,
    type InstructorOwnLessonRatingsPayload,
    type LessonRatingsListPayload,
    type LessonRatingsPeriod,
} from '~/types/lessons/lessonRating';

export interface FetchLessonRatingsInput {
    schoolId: string;
    instructorId?: string;
    period?: LessonRatingsPeriod;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
}

function appendOptionalParam(
    qs: URLSearchParams,
    key: string,
    value: string | number | undefined,
): void {
    if (value === undefined) {
        return;
    }

    const text = String(value).trim();

    if (text.length > 0) {
        qs.set(key, text);
    }
}

function buildRatingsQuery(input: FetchLessonRatingsInput): string {
    const qs = new URLSearchParams({
        schoolId: input.schoolId,
        period: input.period ?? 'latest',
    });

    appendOptionalParam(qs, 'instructorId', input.instructorId);
    appendOptionalParam(qs, 'dateFrom', input.dateFrom);
    appendOptionalParam(qs, 'dateTo', input.dateTo);
    appendOptionalParam(qs, 'limit', input.limit);

    return qs.toString();
}

export function useLessonRatingsListApi() {
    async function fetchManagerRatings(
        input: FetchLessonRatingsInput,
    ): Promise<LessonRatingsListPayload> {
        return await requestBffData<LessonRatingsListPayload>(
            'GET',
            `/api/ratings?${buildRatingsQuery(input)}`,
            {
                fallbackMessage: 'Nie udało się pobrać listy ocen.',
                normalize: normalizeLessonRatingsListPayload,
            },
        );
    }

    async function fetchInstructorRatings(
        instructorId: string,
        input: FetchLessonRatingsInput,
    ): Promise<LessonRatingsListPayload> {
        return await requestBffData<LessonRatingsListPayload>(
            'GET',
            `/api/instructors/${encodeURIComponent(
                instructorId,
            )}/ratings?${buildRatingsQuery(input)}`,
            {
                fallbackMessage: 'Nie udało się pobrać listy ocen instruktora.',
                normalize: normalizeLessonRatingsListPayload,
            },
        );
    }

    async function fetchOwnInstructorRatings(): Promise<InstructorOwnLessonRatingsPayload> {
        return await requestBffData<InstructorOwnLessonRatingsPayload>(
            'GET',
            '/api/ratings/me',
            {
                fallbackMessage: 'Nie udało się pobrać Twoich ocen.',
                normalize: normalizeInstructorOwnLessonRatingsPayload,
            },
        );
    }

    return {
        fetchManagerRatings,
        fetchInstructorRatings,
        fetchOwnInstructorRatings,
    };
}
