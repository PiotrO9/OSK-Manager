import type { Ref } from 'vue';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { ManagerLessonDetail } from '~/types/lessons/managerLesson';
import {
    normalizeStudentDetail,
    type StudentDetail,
} from '~/types/students/student';
import type { Vehicle } from '~/types/vehicles/vehicle';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    buildManagerLessonInstructorsForSelect,
    buildManagerLessonVehiclesForSelect,
    formatManagerLessonInstructorDisplayName,
    formatManagerLessonStudentDisplayName,
    parseInstructorListItemFromApi,
} from '~/utils/lessons/managerLessonEditReferences';
import { requestBffData } from '../core/useApi';

interface UseManagerLessonEditReferencesOptions {
    schoolId: Ref<string>;
    loadedLesson: Ref<ManagerLessonDetail | null>;
    formInstructorId: Ref<string>;
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
    let vehicleFallbackLoadSeq = 0;
    let instructorFallbackLoadSeq = 0;
    let studentDisplayNameLoadSeq = 0;
    let vehiclesLoadSeq = 0;
    let instructorsLoadSeq = 0;

    async function loadVehicleDisplayFallback(
        vehicleId: string | null | undefined,
    ): Promise<void> {
        const seq = ++vehicleFallbackLoadSeq;

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

            if (seq !== vehicleFallbackLoadSeq) {
                return;
            }

            vehicleDisplayFallback.value = vehicle;
        } catch {
            if (seq !== vehicleFallbackLoadSeq) {
                return;
            }

            vehicleDisplayFallback.value = null;
        }
    }

    async function loadInstructorNameFallback(
        instructorId: string,
    ): Promise<void> {
        const id = instructorId.trim();
        const seq = ++instructorFallbackLoadSeq;

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
                if (seq !== instructorFallbackLoadSeq) {
                    return;
                }

                instructorNameFallback.value =
                    formatManagerLessonInstructorDisplayName(normalized);

                return;
            }
        } catch {
            if (seq !== instructorFallbackLoadSeq) {
                return;
            }

            instructorNameFallback.value = null;
        }
    }

    async function loadStudentDisplayName(
        lesson: ManagerLessonDetail,
    ): Promise<void> {
        const seq = ++studentDisplayNameLoadSeq;

        studentDisplayName.value = null;

        const nested = lesson.student;

        if (nested) {
            const name = `${nested.firstName} ${nested.lastName}`.trim();

            studentDisplayName.value = name.length > 0 ? name : null;

            return;
        }

        const schoolId = options.schoolId.value.trim();
        const userId = lesson.studentId.trim();

        if (!schoolId || !userId) {
            studentDisplayName.value = null;

            return;
        }

        try {
            const qs = new URLSearchParams({ schoolId });
            const data = await requestBffData<StudentFallbackData>(
                'GET',
                `/api/students/${encodeURIComponent(userId)}?${qs.toString()}`,
                {
                    fallbackMessage: 'Nie udało się pobrać danych kursanta.',
                },
            );
            const detail: StudentDetail | null = normalizeStudentDetail(data);

            if (detail) {
                if (seq !== studentDisplayNameLoadSeq) {
                    return;
                }

                studentDisplayName.value =
                    formatManagerLessonStudentDisplayName(detail);

                return;
            }
        } catch {
            /* fallback below */
        }

        if (seq !== studentDisplayNameLoadSeq) {
            return;
        }

        studentDisplayName.value =
            userId.length > 12 ? `${userId.slice(0, 8)}…` : userId;
    }

    async function loadVehicles(): Promise<void> {
        const schoolId = options.schoolId.value;
        const seq = ++vehiclesLoadSeq;

        vehiclesError.value = null;
        vehicles.value = [];

        if (!schoolId) {
            return;
        }

        isVehiclesLoading.value = true;

        try {
            const items = await options.fetchVehiclesList(schoolId);

            if (seq !== vehiclesLoadSeq) {
                return;
            }

            vehicles.value = items;
        } catch (err: unknown) {
            if (seq !== vehiclesLoadSeq) {
                return;
            }

            vehiclesError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy pojazdów.',
            );
        } finally {
            if (seq === vehiclesLoadSeq) {
                isVehiclesLoading.value = false;
            }
        }
    }

    async function loadInstructors(): Promise<void> {
        const schoolId = options.schoolId.value;
        const seq = ++instructorsLoadSeq;

        instructorsError.value = null;
        instructors.value = [];

        if (!schoolId) {
            return;
        }

        isInstructorsLoading.value = true;

        try {
            const items = await options.fetchInstructorsList(schoolId);

            if (seq !== instructorsLoadSeq) {
                return;
            }

            instructors.value = items;
        } catch (err: unknown) {
            if (seq !== instructorsLoadSeq) {
                return;
            }

            instructorsError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy instruktorów.',
            );
        } finally {
            if (seq === instructorsLoadSeq) {
                isInstructorsLoading.value = false;
            }
        }
    }

    const instructorsForSelect = computed((): InstructorListItem[] =>
        buildManagerLessonInstructorsForSelect({
            instructors: instructors.value,
            selectedInstructorId: options.formInstructorId.value,
            embeddedInstructor: options.loadedLesson.value?.lessonInstructor,
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
        instructorFallbackLoadSeq += 1;
        vehicleFallbackLoadSeq += 1;
        studentDisplayNameLoadSeq += 1;
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
        isInstructorsLoading,
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
