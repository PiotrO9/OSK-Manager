export type LessonRatingsPeriod = 'latest' | 'yesterday' | 'last7days' | 'all';

export interface LessonRatingPerson {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
}

export interface LessonRatingLesson {
    id: string;
    startTime: string;
    endTime: string;
}

export interface LessonRatingListItem {
    id: string;
    lessonId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    lesson: LessonRatingLesson;
    instructor: LessonRatingPerson;
    student?: LessonRatingPerson;
}

export interface LessonRatingsSummary {
    averageRating: number | null;
    totalCount: number;
}

export interface LessonRatingsListPayload {
    ratings: LessonRatingListItem[];
    summary: LessonRatingsSummary;
}

export interface InstructorOwnLessonRatingsPayload {
    ratings: LessonRatingListItem[];
}

function readString(o: Record<string, unknown>, key: string): string {
    const raw = o[key];

    return raw == null ? '' : String(raw).trim();
}

function normalizePerson(raw: unknown): LessonRatingPerson | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = readString(o, 'id');
    const userId = readString(o, 'userId') || readString(o, 'user_id');

    if (!id || !userId) {
        return null;
    }

    return {
        id,
        userId,
        firstName: readString(o, 'firstName') || readString(o, 'first_name'),
        lastName: readString(o, 'lastName') || readString(o, 'last_name'),
    };
}

function normalizeLesson(raw: unknown): LessonRatingLesson | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = readString(o, 'id');
    const startTime = readString(o, 'startTime') || readString(o, 'start_time');
    const endTime = readString(o, 'endTime') || readString(o, 'end_time');

    if (!id || !startTime || !endTime) {
        return null;
    }

    return { id, startTime, endTime };
}

export function formatLessonRatingPersonName(
    person: LessonRatingPerson | undefined,
): string {
    if (!person) {
        return '-';
    }

    const parts = [person.firstName, person.lastName]
        .map((part) => part.trim())
        .filter(Boolean);

    return parts.length > 0 ? parts.join(' ') : '-';
}

export function normalizeLessonRatingListItem(
    raw: unknown,
): LessonRatingListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = readString(o, 'id');
    const lessonId = readString(o, 'lessonId') || readString(o, 'lesson_id');
    const ratingRaw = o.rating;
    const rating =
        typeof ratingRaw === 'number'
            ? ratingRaw
            : Number.parseInt(String(ratingRaw ?? ''), 10);
    const createdAt = readString(o, 'createdAt') || readString(o, 'created_at');
    const lesson = normalizeLesson(o.lesson);
    const instructor = normalizePerson(o.instructor);

    if (!id || !lessonId || !Number.isFinite(rating) || !createdAt) {
        return null;
    }

    if (!lesson || !instructor) {
        return null;
    }

    const student = normalizePerson(o.student);

    return {
        id,
        lessonId,
        rating,
        comment:
            o.comment === null || o.comment === undefined
                ? null
                : String(o.comment),
        createdAt,
        lesson,
        instructor,
        ...(student ? { student } : {}),
    };
}

export function normalizeLessonRatingsListPayload(
    data: unknown,
): LessonRatingsListPayload {
    if (!data || typeof data !== 'object') {
        return {
            ratings: [],
            summary: { averageRating: null, totalCount: 0 },
        };
    }

    const o = data as Record<string, unknown>;
    const ratingsRaw = Array.isArray(o.ratings) ? o.ratings : [];
    const summary =
        o.summary && typeof o.summary === 'object'
            ? (o.summary as Record<string, unknown>)
            : {};
    const averageRaw = summary.averageRating ?? summary.average_rating;
    const totalRaw = summary.totalCount ?? summary.total_count;
    const average =
        typeof averageRaw === 'number'
            ? averageRaw
            : averageRaw === null || averageRaw === undefined
              ? null
              : Number.parseFloat(String(averageRaw));
    const totalCount =
        typeof totalRaw === 'number'
            ? totalRaw
            : Number.parseInt(String(totalRaw ?? '0'), 10);

    return {
        ratings: ratingsRaw
            .map((item) => normalizeLessonRatingListItem(item))
            .filter((item): item is LessonRatingListItem => item !== null),
        summary: {
            averageRating:
                average !== null && Number.isFinite(average) ? average : null,
            totalCount: Number.isFinite(totalCount) ? totalCount : 0,
        },
    };
}

export function normalizeInstructorOwnLessonRatingsPayload(
    data: unknown,
): InstructorOwnLessonRatingsPayload {
    if (!data || typeof data !== 'object') {
        return { ratings: [] };
    }

    const o = data as Record<string, unknown>;
    const ratingsRaw = Array.isArray(o.ratings) ? o.ratings : [];

    return {
        ratings: ratingsRaw
            .map((item) => normalizeLessonRatingListItem(item))
            .filter((item): item is LessonRatingListItem => item !== null),
    };
}
