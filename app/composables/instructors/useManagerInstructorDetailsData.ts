import {
    normalizeInstructorDetail,
    normalizeInstructorDetailForEdit,
    type InstructorDetail,
    type InstructorEditFormModel,
} from '~/types/instructors/instructor';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    getManagerInstructorGenericLoadErrorMessage,
    getManagerInstructorNotFoundMessage,
    getManagerInstructorRouteString,
} from '~/utils/instructors/managerInstructorDetailsPage';
import { requestBffData } from '../core/useApi';

type InstructorDetailData = InstructorDetail | null;

export function useManagerInstructorDetailsData() {
    const instructor = ref<InstructorDetail | null>(null);
    const editForm = ref<InstructorEditFormModel | null>(null);
    const editBaseline = ref<InstructorEditFormModel | null>(null);
    const isLoading = ref(false);
    const errorMessage = ref<string | null>(null);
    let fetchSeq = 0;

    async function loadInstructor(rawId: unknown): Promise<void> {
        errorMessage.value = null;

        const id = getManagerInstructorRouteString(rawId);

        if (!id) {
            instructor.value = null;
            editForm.value = null;
            editBaseline.value = null;
            errorMessage.value = getManagerInstructorNotFoundMessage();
            isLoading.value = false;

            return;
        }

        const seq = ++fetchSeq;

        isLoading.value = true;
        instructor.value = null;
        editForm.value = null;
        editBaseline.value = null;

        try {
            const data = await requestBffData<InstructorDetailData>(
                'GET',
                `/api/instructors/${encodeURIComponent(id)}`,
                {
                    fallbackMessage:
                        getManagerInstructorGenericLoadErrorMessage(),
                },
            );
            const normalized = normalizeInstructorDetail(data);
            const forEdit = normalizeInstructorDetailForEdit(data);

            if (seq !== fetchSeq) {
                return;
            }

            if (!normalized || !forEdit) {
                errorMessage.value = getManagerInstructorNotFoundMessage();
                instructor.value = null;

                return;
            }

            instructor.value = normalized;
            editForm.value = { ...forEdit };
            editBaseline.value = { ...forEdit };
        } catch (err: unknown) {
            if (seq !== fetchSeq) {
                return;
            }

            const status = getApiErrorStatusCode(err);

            errorMessage.value =
                status === 404 || status === 400
                    ? getManagerInstructorNotFoundMessage()
                    : getApiFetchErrorMessage(
                          err,
                          getManagerInstructorGenericLoadErrorMessage(),
                      );
            instructor.value = null;
        } finally {
            if (seq === fetchSeq) {
                isLoading.value = false;
            }
        }
    }

    return {
        editBaseline,
        editForm,
        errorMessage,
        instructor,
        isLoading,
        loadInstructor,
    };
}
