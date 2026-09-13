import type { LocationQueryValue } from 'vue-router';
import {
    formatCourseKindLabel,
    type CourseDetail,
} from '~/types/courses/course';
import type {
    ManagerCourseCapacityInsight,
    ManagerCourseInfoItem,
} from '~/types/courses/managerCourseDetail';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

export function getRouteIdString(rawId: unknown): string {
    if (typeof rawId === 'string') {
        return rawId.trim();
    }

    if (Array.isArray(rawId)) {
        return String(rawId[0] ?? '').trim();
    }

    return '';
}

export function readSchoolIdFromQuery(
    raw: LocationQueryValue | LocationQueryValue[] | undefined,
): string {
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') {
        return '';
    }

    return s.trim();
}

export function resolveCourseDetailError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak dostępu do szczegółów tego kursu.';
    }

    if (status === 404) {
        return 'Nie znaleziono kursu.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(err, 'Nie udało się wczytać danych kursu.');
}

export function formatCapacityText(capacity: number | null): string {
    if (capacity === null) {
        return 'Brak limitu';
    }

    return String(capacity);
}

export function formatCourseInstructorName(course: CourseDetail): string {
    const name = course.instructor?.name?.trim();

    if (name && name.length > 0) {
        return name;
    }

    return 'Brak instruktora';
}

export function buildCourseOverviewItems(
    course: CourseDetail,
): ManagerCourseInfoItem[] {
    return [
        {
            label: 'Godziny kursu',
            description: `${course.totalHours} h łącznie`,
            badge: `${course.totalHours} h`,
            tone: 'info',
        },
        {
            label: 'Typ kursu',
            description: 'Rodzaj zajęć i organizacji kursu.',
            badge: formatCourseKindLabel(course.type),
            tone: 'neutral',
        },
        {
            label: 'Limit miejsc',
            description: 'Maksymalna liczba uczestników.',
            badge: formatCapacityText(course.capacity),
            tone: course.capacity === null ? 'neutral' : 'success',
        },
    ];
}

export function buildCourseCapacityInsight({
    course,
    participantCount,
}: {
    course: CourseDetail;
    participantCount: number | null;
}): ManagerCourseCapacityInsight {
    const capacity = course.capacity;
    const hasCapacity = capacity !== null;

    if (participantCount === null) {
        return {
            participantCount,
            capacity,
            fillPercentage: null,
            freeSeats: null,
            valueLabel: hasCapacity ? `— / ${capacity}` : '—',
            helperLabel: hasCapacity
                ? 'Nie udało się policzyć zajętych miejsc.'
                : 'Nie udało się policzyć uczestników.',
            badgeLabel: 'Brak danych',
            badgeTone: 'neutral',
            hasCapacity,
            isOverCapacity: false,
        };
    }

    if (!hasCapacity) {
        return {
            participantCount,
            capacity,
            fillPercentage: null,
            freeSeats: null,
            valueLabel: String(participantCount),
            helperLabel: 'Kurs bez limitu miejsc.',
            badgeLabel: `${participantCount} uczestników`,
            badgeTone: participantCount > 0 ? 'info' : 'neutral',
            hasCapacity,
            isOverCapacity: false,
        };
    }

    const safeCapacity = Math.max(0, capacity);
    const fillPercentage =
        safeCapacity === 0
            ? participantCount > 0
                ? 100
                : 0
            : Math.min(
                  100,
                  Math.round((participantCount / safeCapacity) * 100),
              );
    const freeSeats = Math.max(0, safeCapacity - participantCount);
    const isOverCapacity = participantCount > safeCapacity;

    return {
        participantCount,
        capacity: safeCapacity,
        fillPercentage,
        freeSeats,
        valueLabel: `${participantCount} / ${safeCapacity}`,
        helperLabel: isOverCapacity
            ? `${participantCount - safeCapacity} ponad limit`
            : `${freeSeats} wolnych miejsc`,
        badgeLabel: isOverCapacity
            ? 'Przekroczony limit'
            : freeSeats === 0
              ? 'Komplet'
              : 'Są miejsca',
        badgeTone: isOverCapacity
            ? 'warning'
            : freeSeats === 0
              ? 'info'
              : 'success',
        hasCapacity,
        isOverCapacity,
    };
}
