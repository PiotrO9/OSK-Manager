import type { Ref } from 'vue';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { ManagerLessonDetail } from '~/types/lessons/managerLesson';
import {
    normalizeStudentDetail,
    type StudentDetail,
} from '~/types/students/student';
import type { Vehicle } from '~/types/vehicles/vehicle';
import { normalizeInstructorsList } from '~/types/instructors/instructor';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    buildManagerLessonInstructorsForSelect,
    buildManagerLessonVehiclesForSelect,
    formatManagerLessonInstructorDisplayName,
    formatManagerLessonStudentDisplayName,
    parseInstructorListItemFromApi,
} from '~/utils/lessons/managerLessonEditReferences';
import { requestBffData } from '../core/useApi';
import { useDebouncedAbortableRequest } from '~/composables/schedule/useDebouncedAbortableRequest';

interface UseManagerLessonEditReferencesOptions {
    schoolId: Ref<string>;
    loadedLesson: Ref<ManagerLessonDetail | null>;
    formInstructorId: Ref<string>;
    formStartLocal: Ref<string>;
    formEndLocal: Ref<string>;
    formVehicleId: Ref<string>;
    fetchVehiclesList: (schoolId: string) => Promise<Vehicle[]>;
    fetchVehicleById: (id: string) => Promise<Vehicle>;
    fetchInstructorsList: (schoolId: string) => Promise<InstructorListItem[]>;
}

type InstructorFallbackData = Record<string, unknown>;
type StudentFallbackData = StudentDetail | null;

export function useManagerLessonEditReferences(
    options: UseManagerLessonEditReferencesOptions,
) {
    const vehicles = ref<Vehicle[]>([]);
    const vehiclesError = ref<string | null>(null);
    const isVehiclesLoading = ref(false);

    const instructors = ref<InstructorListItem[]>([]);
    const instructorsError = ref<string | null>(null);
    const isInstructorsLoading = ref(false);

    const instructorNameFallback = ref<string | null>(null);
    const vehicleDisplayFallback = ref<Vehicle | null>(null);
    const studentDisplayName = ref<string | null>(null);
    let vehicleFallbackLoadSequence = 0;
    let instructorFallbackLoadSequence = 0;
    let studentDisplayNameLoadSequence = 0;
    let vehiclesLoadSequence = 0;
    let instructorsLoadSequence = 0;

    const candidate = computed(() => {
        const lesson = options.loadedLesson.value;
        const [date = '', startTime = ''] =
            options.formStartLocal.value.split('T');
        const [endDate = '', endTime = ''] =
            options.formEndLocal.value.split('T');
        const vehicleId = options.formVehicleId.value.trim();

        if (
            !lesson ||
            !date ||
            !startTime ||
            !endTime ||
            endDate !== date ||
            startTime >= endTime ||
            !vehicleId
        )
            return null;

        return { lessonId: lesson.id, date, startTime, endTime, vehicleId };
    });
    const instructorOptions = useDebouncedAbortableRequest({
        candidate,
        debounceMs: 150,
        fetcher: async (input, signal) => {
            const query = new URLSearchParams({
                date: input.date,
                startTime: input.startTime,
                endTime: input.endTime,
                vehicleId: input.vehicleId,
            });

            return requestBffData<InstructorListItem[]>(
                'GET',
                `/api/lessons/${encodeURIComponent(input.lessonId)}/instructor-options?${query}`,
                {
                    signal,
                    fallbackMessage:
                        'Nie udało się pobrać dostępnych instruktorów.',
                    normalize: normalizeInstructorsList,
                },
            );
        },
    });

    async function loadVehicleDisplayFallback(
        vehicleId: string | null | undefined,
    ): Promise<void> {
        const requestSequence = ++vehicleFallbackLoadSequence;

        vehicleDisplayFallback.value = null;

        const id =
            typeof vehicleId === 'string'
                ? vehicleId.trim()
                : vehicleId != null
                  ? String(vehicleId).trim()
                  : '';

        if (!id) {
            return;
        }

        try {
            const vehicle = await options.fetchVehicleById(id);

            if (requestSequence !== vehicleFallbackLoadSequence) {
                return;
            }

            vehicleDisplayFallback.value = vehicle;
        } catch {
            if (requestSequence !== vehicleFallbackLoadSequence) {
                return;
            }

            vehicleDisplayFallback.value = null;
        }
    }

    async function loadInstructorNameFallback(
        instructorId: string,
    ): Promise<void> {
        const id = instructorId.trim();
        const requestSequence = ++instructorFallbackLoadSequence;

        if (!id) {
            instructorNameFallback.value = null;

            return;
        }

        try {
            const data = await requestBffData<InstructorFallbackData>(
                'GET',
                `/api/instructors/${encodeURIComponent(id)}`,
                {
                    fallbackMessage: 'Nie udało się pobrać danych instruktora.',
                },
            );
            const normalized = parseInstructorListItemFromApi(data);

            if (normalized) {
                if (requestSequence !== instructorFallbackLoadSequence) {
                    return;
                }

                instructorNameFallback.value =
                    formatManagerLessonInstructorDisplayName(normalized);

                return;
            }
        } catch {
            if (requestSequence !== instructorFallbackLoadSequence) {
                return;
            }

            instructorNameFallback.value = null;
        }
    }

    async function loadStudentDisplayName(
        lesson: ManagerLessonDetail,
    ): Promise<void> {
        const requestSequence = ++studentDisplayNameLoadSequence;

        studentDisplayName.value = null;

        const nested = lesson.student;

        if (nested) {
            const name = `${nested.firstName} ${nested.lastName}`.trim();

            studentDisplayName.value = name.length > 0 ? name : null;

            return;
        }

        const userId = lesson.studentUserId?.trim() ?? '';

        if (!userId) {
            const profileId = lesson.studentId.trim();

            studentDisplayName.value = profileId
                ? profileId.length > 12
                    ? `${profileId.slice(0, 8)}…`
                    : profileId
                : null;

            return;
        }

        try {
            const data = await requestBffData<StudentFallbackData>(
                'GET',
                `/api/students/${encodeURIComponent(userId)}`,
                {
                    fallbackMessage: 'Nie udało się pobrać danych kursanta.',
                },
            );
            const detail: StudentDetail | null = normalizeStudentDetail(data);

            if (detail) {
                if (requestSequence !== studentDisplayNameLoadSequence) {
                    return;
                }

                studentDisplayName.value =
                    formatManagerLessonStudentDisplayName(detail);

                return;
            }
        } catch {
            /* fallback below */
        }

        if (requestSequence !== studentDisplayNameLoadSequence) {
            return;
        }

        studentDisplayName.value =
            userId.length > 12 ? `${userId.slice(0, 8)}…` : userId;
    }

    async function loadVehicles(): Promise<void> {
        const schoolId = options.schoolId.value;
        const requestSequence = ++vehiclesLoadSequence;

        vehiclesError.value = null;
        vehicles.value = [];

        if (!schoolId) {
            return;
        }

        isVehiclesLoading.value = true;

        try {
            const items = await options.fetchVehiclesList(schoolId);

            if (requestSequence !== vehiclesLoadSequence) {
                return;
            }

            vehicles.value = items;
        } catch (err: unknown) {
            if (requestSequence !== vehiclesLoadSequence) {
                return;
            }

            vehiclesError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy pojazdów.',
            );
        } finally {
            if (requestSequence === vehiclesLoadSequence) {
                isVehiclesLoading.value = false;
            }
        }
    }

    async function loadInstructors(): Promise<void> {
        const schoolId = options.schoolId.value;
        const requestSequence = ++instructorsLoadSequence;

        instructorsError.value = null;
        instructors.value = [];

        if (!schoolId) {
            return;
        }

        isInstructorsLoading.value = true;

        try {
            const items = await options.fetchInstructorsList(schoolId);

            if (requestSequence !== instructorsLoadSequence) {
                return;
            }

            instructors.value = items;
        } catch (err: unknown) {
            if (requestSequence !== instructorsLoadSequence) {
                return;
            }

            instructorsError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy instruktorów.',
            );
        } finally {
            if (requestSequence === instructorsLoadSequence) {
                isInstructorsLoading.value = false;
            }
        }
    }

    const instructorsForSelect = computed((): InstructorListItem[] =>
        buildManagerLessonInstructorsForSelect({
            instructors: (instructorOptions.result.value ?? []).map((item) => ({
                ...item,
                qualifiedCourseTypes: item.qualifiedCourseTypes
                    ? [...item.qualifiedCourseTypes]
                    : undefined,
            })),
            selectedInstructorId: options.formInstructorId.value,
            embeddedInstructor:
                instructors.value.find(
                    (item) => item.id === options.formInstructorId.value,
                ) ?? options.loadedLesson.value?.lessonInstructor,
            fallbackLabel: instructorNameFallback.value,
        }),
    );

    const vehiclesForSelect = computed((): Vehicle[] =>
        buildManagerLessonVehiclesForSelect({
            vehicles: vehicles.value,
            selectedVehicleId: options.formVehicleId.value,
            embeddedVehicle: options.loadedLesson.value?.lessonVehicle,
            fallbackVehicle: vehicleDisplayFallback.value,
        }),
    );

    const instructorSelectLabel = computed((): string => {
        const id = options.formInstructorId.value.trim();

        if (!id) {
            return '—';
        }

        const fromList = instructorsForSelect.value.find(
            (item) => item.id === id,
        );

        if (fromList) {
            return formatManagerLessonInstructorDisplayName(fromList);
        }

        return instructorNameFallback.value?.trim() || id;
    });

    watch(
        () => [options.formInstructorId.value, instructors.value] as const,
        () => {
            const id = options.formInstructorId.value.trim();
            const hit = instructors.value.find((item) => item.id === id);

            if (hit) {
                instructorNameFallback.value = null;
            }
        },
        { deep: true },
    );

    watch(
        () => [options.formVehicleId.value, vehicles.value] as const,
        () => {
            const id = options.formVehicleId.value.trim();
            const hit = vehicles.value.find((vehicle) => vehicle.id === id);

            if (hit) {
                vehicleDisplayFallback.value = null;
            }
        },
        { deep: true },
    );

    function clearFallbacks(): void {
        instructorFallbackLoadSequence += 1;
        vehicleFallbackLoadSequence += 1;
        studentDisplayNameLoadSequence += 1;
        instructorNameFallback.value = null;
        vehicleDisplayFallback.value = null;
    }

    function loadLessonReferences(lesson: ManagerLessonDetail): void {
        if (!lesson.lessonInstructor && lesson.instructorId.trim()) {
            void loadInstructorNameFallback(lesson.instructorId);
        }

        if (!lesson.lessonVehicle && lesson.vehicleId?.trim()) {
            void loadVehicleDisplayFallback(lesson.vehicleId);
        }

        void loadStudentDisplayName(lesson);
    }

    return {
        vehiclesError,
        isVehiclesLoading,
        instructorsError,
        isInstructorsLoading: computed(
            () =>
                isInstructorsLoading.value ||
                instructorOptions.status.value === 'loading',
        ),
        instructorOptionsError: computed(() =>
            instructorOptions.status.value === 'error'
                ? 'Nie udało się pobrać dostępnych instruktorów. Spróbuj ponownie.'
                : null,
        ),
        hasAvailableInstructors: computed(
            () =>
                instructorOptions.status.value === 'success' &&
                (instructorOptions.result.value?.length ?? 0) === 0,
        ),
        studentDisplayName,
        instructorsForSelect,
        vehiclesForSelect,
        instructorSelectLabel,
        clearFallbacks,
        loadLessonReferences,
        loadVehicles,
        loadInstructors,
    };
}
