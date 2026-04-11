import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import type { SchoolAvailabilitySlot } from '~/types/schoolAvailabilitySlots';
import type { SchoolAvailabilitySlotsQueryFilters } from '~/types/schoolAvailabilityFilters';

function buildSchoolSlotsSearchParams(
    dateFrom: string,
    dateTo: string,
    filters?: SchoolAvailabilitySlotsQueryFilters,
): URLSearchParams {
    const params = new URLSearchParams({
        dateFrom,
        dateTo,
    });

    if (!filters) {
        return params;
    }

    if (filters.instructorIds?.length) {
        for (const id of filters.instructorIds) {
            const trimmed = id.trim();

            if (trimmed) {
                params.append('instructorIds', trimmed);
            }
        }
    }

    if (filters.timeFrom?.trim()) {
        params.set('timeFrom', filters.timeFrom.trim());
    }

    if (filters.timeTo?.trim()) {
        params.set('timeTo', filters.timeTo.trim());
    }

    if (filters.weekdays?.length) {
        params.set('weekdays', filters.weekdays.join(','));
    }

    if (filters.slotDurationMinutes !== undefined) {
        params.set('slotDurationMinutes', String(filters.slotDurationMinutes));
    }

    if (filters.courseId?.trim()) {
        params.set('courseId', filters.courseId.trim());
    }

    if (filters.lessonType) {
        params.set('lessonType', filters.lessonType);
    }

    if (filters.sort) {
        params.set('sort', filters.sort);
    }

    if (filters.limit !== undefined) {
        params.set('limit', String(filters.limit));
    }

    if (filters.offset !== undefined) {
        params.set('offset', String(filters.offset));
    }

    if (filters.excludeMyLessons !== undefined) {
        params.set('excludeMyLessons', String(filters.excludeMyLessons));
    }

    return params;
}

function buildSchoolSlotsUrl(
    schoolId: string,
    dateFrom: string,
    dateTo: string,
    filters?: SchoolAvailabilitySlotsQueryFilters,
): string {
    const query = buildSchoolSlotsSearchParams(dateFrom, dateTo, filters);

    return resolveBffEndpoint(
        `/api/driving-schools/${encodeURIComponent(schoolId)}/availability/slots?${query.toString()}`,
    );
}

export function useSchoolAvailabilitySlotsApi() {
    const isLoading = ref(false);

    async function fetchSlots(
        schoolId: string,
        dateFrom: string,
        dateTo: string,
        filters?: SchoolAvailabilitySlotsQueryFilters,
    ): Promise<{ slots: SchoolAvailabilitySlot[]; total: number }> {
        const sid = schoolId.trim();

        if (!sid) {
            return { slots: [], total: 0 };
        }

        const from = dateFrom.trim();
        const to = dateTo.trim();

        if (!from || !to) {
            return { slots: [], total: 0 };
        }

        isLoading.value = true;

        try {
            const raw = await $fetch<unknown>(
                buildSchoolSlotsUrl(sid, from, to, filters),
                {
                    credentials: 'include',
                },
            );

            const data = unwrapApiSuccessData<{
                slots: SchoolAvailabilitySlot[];
                total?: number;
            }>(raw);

            const slots = Array.isArray(data?.slots) ? data.slots : [];
            const total =
                typeof data?.total === 'number' ? data.total : slots.length;

            return { slots, total };
        } finally {
            isLoading.value = false;
        }
    }

    return {
        isLoading: readonly(isLoading),
        fetchSlots,
    };
}
