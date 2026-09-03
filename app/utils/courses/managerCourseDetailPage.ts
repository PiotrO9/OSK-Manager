import type { LocationQueryValue } from 'vue-router';
import {
    formatCourseKindLabel,
    type CourseDetail,
} from '~/types/courses/course';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

interface ManagerCourseInfoItem {
    label: string;
    description: string;
    badge: string;
    tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

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
        return 'Brak dost�pu do szczeg��w tego kursu.';
    }

    if (status === 404) {
        return 'Nie znaleziono kursu.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedost�pny. Spr�buj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(err, 'Nie uda�o si� wczyta� danych kursu.');
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
            description: `${course.totalHours} h lacznie`,
            badge: `${course.totalHours} h`,
            tone: 'info',
        },
        {
            label: 'Typ kursu',
            description: 'Rodzaj zajec i organizacji kursu.',
            badge: formatCourseKindLabel(course.type),
            tone: 'neutral',
        },
        {
            label: 'Limit miejsc',
            description: 'Maksymalna liczba uczestnikow.',
            badge: formatCapacityText(course.capacity),
            tone: course.capacity === null ? 'neutral' : 'success',
        },
    ];
}

export function buildCourseRelatedItems({
    course,
    courseCategoryLabel,
    effectiveSchoolId,
}: {
    course: CourseDetail;
    courseCategoryLabel: string;
    effectiveSchoolId: string;
}): ManagerCourseInfoItem[] {
    return [
        {
            label: 'Instruktor',
            description: 'Przypisanie edytowane w panelu obok.',
            badge: formatCourseInstructorName(course),
        },
        {
            label: 'Kategoria',
            description: 'Zachowana w konfiguracji kursu.',
            badge: courseCategoryLabel,
        },
        {
            label: 'OSK',
            description: 'Kontekst pobrany z linku lub danych kursu.',
            badge: effectiveSchoolId ? 'Powiazane' : 'Brak ID',
        },
    ];
}
