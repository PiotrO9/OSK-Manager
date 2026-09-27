import { usePageMeta } from '../core/usePageMeta';

export function useManagerEventEditPage() {
    const route = useRoute();
    const router = useRouter();

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

    const eventId = computed(getEventIdFromRoute);

    onMounted(() => {
        if (!('schoolId' in route.query)) {
            return;
        }

        const query = { ...route.query };

        delete query.schoolId;

        void router.replace({ path: route.path, query, hash: route.hash });
    });

    usePageMeta({
        title: () => 'Edycja wydarzenia',
        description: () => 'Zmie? dane bloku czasu instruktora.',
    });

    return {
        eventId,
    };
}
