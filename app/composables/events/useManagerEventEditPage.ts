import { usePageMeta } from '../core/usePageMeta';

export function useManagerEventEditPage() {
    const route = useRoute();

    function getEventIdFromRoute(): string {
        const raw = route.params.id;

        if (typeof raw === 'string') {
            return raw.trim();
        }

        if (Array.isArray(raw)) {
            return String(raw[0] ?? '').trim();
        }

        return '';
    }

    function readSchoolIdFromQuery(): string {
        const raw = route.query.schoolId;
        const s = Array.isArray(raw) ? raw[0] : raw;

        if (typeof s !== 'string') {
            return '';
        }

        return s.trim();
    }

    const eventId = computed(getEventIdFromRoute);
    const schoolId = computed(readSchoolIdFromQuery);

    usePageMeta({
        title: () => 'Edycja wydarzenia',
        description: () => 'Zmie? dane bloku czasu instruktora.',
    });

    return {
        eventId,
        schoolId,
    };
}
