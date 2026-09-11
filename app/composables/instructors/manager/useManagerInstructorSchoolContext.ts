import type { Ref } from 'vue';
import {
    normalizeInstructorDetail,
    type InstructorDetail,
} from '~/types/instructors/instructor';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

type InstructorDetailData = InstructorDetail | null;

export function useManagerInstructorSchoolContext(input: {
    instructorId: Ref<string>;
}) {
    const schoolId = ref('');
    const isSchoolContextLoading = ref(false);
    const schoolContextError = ref<string | null>(null);
    let fetchSeq = 0;

    async function loadInstructorSchoolContext(): Promise<void> {
        const id = input.instructorId.value.trim();
        const seq = ++fetchSeq;

        schoolId.value = '';
        schoolContextError.value = null;

        if (!id) {
            isSchoolContextLoading.value = false;

            return;
        }

        isSchoolContextLoading.value = true;

        try {
            const data = await requestBffData<InstructorDetailData>(
                'GET',
                `/api/instructors/${encodeURIComponent(id)}`,
                {
                    fallbackMessage:
                        'Nie udało się pobrać kontekstu instruktora.',
                },
            );
            const normalized = normalizeInstructorDetail(data);

            if (seq !== fetchSeq) {
                return;
            }

            if (!normalized) {
                schoolContextError.value =
                    'Nie udało się ustalić szkoły instruktora.';

                return;
            }

            schoolId.value = normalized.schoolId;
        } catch (err: unknown) {
            if (seq !== fetchSeq) {
                return;
            }

            schoolContextError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się ustalić szkoły instruktora.',
            );
        } finally {
            if (seq === fetchSeq) {
                isSchoolContextLoading.value = false;
            }
        }
    }

    return {
        schoolId,
        isSchoolContextLoading,
        schoolContextError,
        loadInstructorSchoolContext,
    };
}
