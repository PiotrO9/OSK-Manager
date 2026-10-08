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

function readString(record: Record<string, unknown>, key: string): string {
    const raw = record[key];

    return raw == null ? '' : String(raw).trim();
}

function normalizePerson(raw: unknown): LessonRatingPerson | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const record = raw as Record<string, unknown>;
    const id = readString(record, 'id');
    const userId =
        readString(record, 'userId') || readString(record, 'user_id');

    if (!id || !userId) {
        return null;
    }

    return {
        id,
        userId,
        firstName:
            readString(record, 'firstName') || readString(record, 'first_name'),
        lastName:
            readString(record, 'lastName') || readString(record, 'last_name'),
        avatarUrl: readAvatarUrlFromRecord(record),
    };
}

function normalizeCourse(raw: unknown): LessonRatingCourse | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const record = raw as Record<string, unknown>;
    const courseType =
        record.courseType && typeof record.courseType === 'object'
            ? (record.courseType as Record<string, unknown>)
            : {};
    const id = readString(record, 'id');
    const name = readString(record, 'name');
    const totalHours = Number(record.totalHours ?? record.total_hours);

    if (!id || !name || !Number.isFinite(totalHours)) {
        return null;
    }

    return {
        id,
        name,
        category: readString(record, 'category'),
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

    const record = raw as Record<string, unknown>;
    const id = readString(record, 'id');
    const name = readString(record, 'name');
    const registrationNumber =
        readString(record, 'registrationNumber') ||
        readString(record, 'registration_number');

    if (!id || !name || !registrationNumber) {
        return null;
    }

    return {
        id,
        name,
        registrationNumber,
        brand: readString(record, 'brand') || null,
        model: readString(record, 'model') || null,
    };
}

function normalizeLesson(raw: unknown): LessonRatingLesson | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const record = raw as Record<string, unknown>;
    const id = readString(record, 'id');
    const startTime =
        readString(record, 'startTime') || readString(record, 'start_time');
    const endTime =
        readString(record, 'endTime') || readString(record, 'end_time');
    const sequenceNumberRaw = record.sequenceNumber ?? record.sequence_number;
    const sequenceNumber = Number(sequenceNumberRaw);
    const completedMinutesRaw =
        record.completedMinutesAfterLesson ??
        record.completed_minutes_after_lesson;
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
        course: normalizeCourse(record.course),
        vehicle: normalizeVehicle(record.vehicle),
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

    const record = raw as Record<string, unknown>;
    const id = readString(record, 'id');
    const lessonId =
        readString(record, 'lessonId') || readString(record, 'lesson_id');
    const ratingRaw = record.rating;
    const rating =
        typeof ratingRaw === 'number'
            ? ratingRaw
            : Number.parseInt(String(ratingRaw ?? ''), 10);
    const createdAt =
        readString(record, 'createdAt') || readString(record, 'created_at');
    const lesson = normalizeLesson(record.lesson);
    const instructor = normalizePerson(record.instructor);

    if (!id || !lessonId || !Number.isFinite(rating) || !createdAt) {
        return null;
    }

    if (!lesson || !instructor) {
        return null;
    }

    const student = normalizePerson(record.student);

    return {
        id,
        lessonId,
        rating,
        comment:
            record.comment === null || record.comment === undefined
                ? null
                : String(record.comment),
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

    const record = data as Record<string, unknown>;
    const ratingsRaw = Array.isArray(record.ratings) ? record.ratings : [];
    const summary =
        record.summary && typeof record.summary === 'object'
            ? (record.summary as Record<string, unknown>)
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
    const record =
        data && typeof data === 'object'
            ? (data as Record<string, unknown>)
            : {};
    const pagination =
        record.pagination && typeof record.pagination === 'object'
            ? (record.pagination as Record<string, unknown>)
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

    const record = data as Record<string, unknown>;
    const normalizedList = normalizeLessonRatingsListPayload(record);
    const ratings = normalizedList.ratings.map(
        ({ student: _student, ...item }) => item,
    );

    return {
        ratings,
        summary: normalizedList.summary,
        pagination: normalizeLessonRatingsPagination(data, 20),
    };
}
