import type { ManagerAttentionPayload } from '~/types/manager/attentionItem';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

function emptyAttentionPayload(): ManagerAttentionPayload {
    return { items: [], total: 0, hiddenCount: 0 };
}

export function useManagerDashboardPage() {
    const { fetchDefaultDrivingSchool, isDefaultLoading } =
        useDrivingSchoolsApi();
    const { fetchAttentionItems, isLoading: isAttentionLoading } =
        useManagerAttentionItemsApi();
    const defaultSchool = shallowRef<DrivingSchool | null>(null);
    const defaultSchoolError = shallowRef<string | null>(null);
    const isNotConfigured = shallowRef(false);
    const attention = ref<ManagerAttentionPayload>(emptyAttentionPayload());
    const attentionError = shallowRef<string | null>(null);
    let loadSequence = 0;

    async function loadAttention(schoolId?: string): Promise<void> {
        const id = schoolId?.trim() || defaultSchool.value?.id.trim() || '';

        if (!id) return;

        attentionError.value = null;

        try {
            attention.value = await fetchAttentionItems(id);
        } catch (error: unknown) {
            attentionError.value = getApiFetchErrorMessage(
                error,
                'Nie udało się pobrać spraw wymagających uwagi.',
            );
        }
    }

    async function loadDashboard(): Promise<void> {
        const sequence = ++loadSequence;

        defaultSchoolError.value = null;
        isNotConfigured.value = false;

        const result = await fetchDefaultDrivingSchool();

        if (sequence !== loadSequence) return;

        if (result.outcome === 'not_configured') {
            defaultSchool.value = null;
            attention.value = emptyAttentionPayload();
            isNotConfigured.value = true;

            return;
        }

        if (result.outcome !== 'ok') {
            defaultSchoolError.value =
                result.outcome === 'unreadable'
                    ? 'Dane domyślnej szkoły są nieprawidłowe.'
                    : 'Nie udało się pobrać domyślnej szkoły.';

            return;
        }

        const schoolChanged = defaultSchool.value?.id !== result.school.id;

        defaultSchool.value = result.school;

        if (schoolChanged) {
            attention.value = emptyAttentionPayload();
        }

        await loadAttention(result.school.id);
    }

    onMounted(() => {
        void loadDashboard();
    });

    return {
        attention: readonly(attention),
        attentionError: readonly(attentionError),
        defaultSchool: computed(() => defaultSchool.value),
        defaultSchoolError: readonly(defaultSchoolError),
        isAttentionLoading,
        isDefaultLoading,
        isNotConfigured: readonly(isNotConfigured),
        loadAttention,
        loadDashboard,
    };
}
