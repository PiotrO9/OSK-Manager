import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import {
    normalizeInstructorOwnLessonRatingsPayload,
    normalizeLessonRatingsListPayload,
    type InstructorOwnLessonRatingsPayload,
    type LessonRatingsListPayload,
    type LessonRatingsPeriod,
} from '~/types/lessonRating';

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
        const raw = await $fetch<unknown>(
            resolveBffEndpoint(`/api/ratings?${buildRatingsQuery(input)}`),
            { credentials: 'include' },
        );
        const data = unwrapApiSuccessData<unknown>(raw);

        return normalizeLessonRatingsListPayload(data);
    }

    async function fetchInstructorRatings(
        instructorId: string,
        input: FetchLessonRatingsInput,
    ): Promise<LessonRatingsListPayload> {
        const raw = await $fetch<unknown>(
            resolveBffEndpoint(
                `/api/instructors/${encodeURIComponent(
                    instructorId,
                )}/ratings?${buildRatingsQuery(input)}`,
            ),
            { credentials: 'include' },
        );
        const data = unwrapApiSuccessData<unknown>(raw);

        return normalizeLessonRatingsListPayload(data);
    }

    async function fetchOwnInstructorRatings(): Promise<InstructorOwnLessonRatingsPayload> {
        const raw = await $fetch<unknown>(
            resolveBffEndpoint('/api/ratings/me'),
            {
                credentials: 'include',
            },
        );
        const data = unwrapApiSuccessData<unknown>(raw);

        return normalizeInstructorOwnLessonRatingsPayload(data);
    }

    return {
        fetchManagerRatings,
        fetchInstructorRatings,
        fetchOwnInstructorRatings,
    };
}
