import { readAvatarUrlFromRecord } from '~/types/profileAvatar';

export type LessonRatingsPeriod =
    | 'latest'
    | 'yesterday'
    | 'last7days'
    | 'last30days'
    | 'all';

export interface LessonRatingPerson {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
}

export interface LessonRatingLesson {
    id: string;
    startTime: string;
    endTime: string;
    sequenceNumber: number | null;
    completedMinutesAfterLesson: number | null;
    course: LessonRatingCourse | null;
    vehicle: LessonRatingVehicle | null;
}

export interface LessonRatingCourse {
    id: string;
    name: string;
    category: string;
    totalHours: number;
    courseType: {
        code: string;
        name: string;
    };
}

export interface LessonRatingVehicle {
    id: string;
    name: string;
    registrationNumber: string;
    brand: string | null;
    model: string | null;
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

export interface LessonRatingsPagination {
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedLessonRatingsPayload extends LessonRatingsListPayload {
    pagination: LessonRatingsPagination;
}

export interface InstructorOwnLessonRatingsPayload extends LessonRatingsListPayload {
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
    };
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
        avatarUrl: readAvatarUrlFromRecord(o),
    };
}

function normalizeCourse(raw: unknown): LessonRatingCourse | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const courseType =
        o.courseType && typeof o.courseType === 'object'
            ? (o.courseType as Record<string, unknown>)
            : {};
    const id = readString(o, 'id');
    const name = readString(o, 'name');
    const totalHours = Number(o.totalHours ?? o.total_hours);

    if (!id || !name || !Number.isFinite(totalHours)) {
        return null;
    }

    return {
        id,
        name,
        category: readString(o, 'category'),
        totalHours,
        courseType: {
            code: readString(courseType, 'code'),
            name: readString(courseType, 'name'),
        },
    };
}

function normalizeVehicle(raw: unknown): LessonRatingVehicle | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = readString(o, 'id');
    const name = readString(o, 'name');
    const registrationNumber =
        readString(o, 'registrationNumber') ||
        readString(o, 'registration_number');

    if (!id || !name || !registrationNumber) {
        return null;
    }

    return {
        id,
        name,
        registrationNumber,
        brand: readString(o, 'brand') || null,
        model: readString(o, 'model') || null,
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
    const sequenceNumberRaw = o.sequenceNumber ?? o.sequence_number;
    const sequenceNumber = Number(sequenceNumberRaw);
    const completedMinutesRaw =
        o.completedMinutesAfterLesson ?? o.completed_minutes_after_lesson;
    const completedMinutesAfterLesson =
        completedMinutesRaw === null || completedMinutesRaw === undefined
            ? null
            : Number(completedMinutesRaw);

    if (!id || !startTime || !endTime) {
        return null;
    }

    return {
        id,
        startTime,
        endTime,
        sequenceNumber:
            Number.isInteger(sequenceNumber) && sequenceNumber > 0
                ? sequenceNumber
                : null,
        completedMinutesAfterLesson:
            completedMinutesAfterLesson !== null &&
            Number.isFinite(completedMinutesAfterLesson) &&
            completedMinutesAfterLesson >= 0
                ? completedMinutesAfterLesson
                : null,
        course: normalizeCourse(o.course),
        vehicle: normalizeVehicle(o.vehicle),
    };
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

function normalizeLessonRatingsPagination(
    data: unknown,
    defaultLimit: number,
): LessonRatingsPagination {
    const o =
        data && typeof data === 'object'
            ? (data as Record<string, unknown>)
            : {};
    const pagination =
        o.pagination && typeof o.pagination === 'object'
            ? (o.pagination as Record<string, unknown>)
            : {};
    const readPositiveInt = (value: unknown, fallback: number): number => {
        const parsed = Number.parseInt(String(value ?? ''), 10);

        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    };

    const page = readPositiveInt(pagination.page, 1);
    const limit = readPositiveInt(pagination.limit, defaultLimit);
    const totalCount =
        normalizeLessonRatingsListPayload(data).summary.totalCount;

    return {
        page,
        limit,
        totalPages: readPositiveInt(
            pagination.totalPages ?? pagination.total_pages,
            Math.max(1, Math.ceil(totalCount / limit)),
        ),
    };
}

export function normalizePaginatedLessonRatingsPayload(
    data: unknown,
): PaginatedLessonRatingsPayload {
    const normalizedList = normalizeLessonRatingsListPayload(data);

    return {
        ...normalizedList,
        pagination: normalizeLessonRatingsPagination(data, 20),
    };
}

export function normalizeInstructorOwnLessonRatingsPayload(
    data: unknown,
): InstructorOwnLessonRatingsPayload {
    if (!data || typeof data !== 'object') {
        return {
            ratings: [],
            summary: { averageRating: null, totalCount: 0 },
            pagination: { page: 1, limit: 20, totalPages: 1 },
        };
    }

    const o = data as Record<string, unknown>;
    const normalizedList = normalizeLessonRatingsListPayload(o);
    const ratings = normalizedList.ratings.map(
        ({ student: _student, ...item }) => item,
    );

    return {
        ratings,
        summary: normalizedList.summary,
        pagination: normalizeLessonRatingsPagination(data, 20),
    };
}
