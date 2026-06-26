import type { Ref } from 'vue';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { ManagerLessonDetail } from '~/types/lessons/managerLesson';
import {
    formatStudentDisplayName,
    normalizeStudentDetail,
    type StudentDetail,
} from '~/types/students/student';
import type { Vehicle } from '~/types/vehicles/vehicle';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { unwrapApiSuccessData } from '~/utils/api/apiEnvelope';
import { resolveBffEndpoint } from '~/utils/api/bffEndpoint';

interface UseManagerLessonEditReferencesOptions {
    schoolId: Ref<string>;
    loadedLesson: Ref<ManagerLessonDetail | null>;
    formInstructorId: Ref<string>;
    formVehicleId: Ref<string>;
    fetchVehiclesList: (schoolId: string) => Promise<Vehicle[]>;
    fetchVehicleById: (id: string) => Promise<Vehicle>;
    fetchInstructorsList: (schoolId: string) => Promise<InstructorListItem[]>;
}

function formatInstructorDisplayName(item: InstructorListItem): string {
    const parts = [item.firstName, item.lastName]
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

    return parts.length > 0 ? parts.join(' ') : 'â€”';
}

export function parseInstructorListItemFromApi(
    raw: unknown,
): InstructorListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id.trim() : '';

    if (!id) {
        return null;
    }

    const firstName =
        typeof o.firstName === 'string'
            ? o.firstName.trim()
            : typeof o.first_name === 'string'
              ? o.first_name.trim()
              : '';
    const lastName =
        typeof o.lastName === 'string'
            ? o.lastName.trim()
            : typeof o.last_name === 'string'
              ? o.last_name.trim()
              : '';
    const email =
        typeof o.email === 'string'
            ? o.email.trim()
            : typeof o.Email === 'string'
              ? o.Email.trim()
              : '';

    return { id, firstName, lastName, email };
}

export function buildManagerLessonInstructorsForSelect(params: {
    instructors: readonly InstructorListItem[];
    selectedInstructorId: string;
    embeddedInstructor?: InstructorListItem;
    fallbackLabel?: string | null;
}): InstructorListItem[] {
    const list = [...params.instructors];
    const id = params.selectedInstructorId.trim();

    if (!id || list.some((item) => item.id === id)) {
        return list;
    }

    const embedded =
        params.embeddedInstructor?.id === id ? params.embeddedInstructor : null;
    const fallback = params.fallbackLabel?.trim();
    const synthetic: InstructorListItem = embedded ?? {
        id,
        firstName: fallback ? fallback : 'Aktualny',
        lastName: '',
        email: '',
    };

    return [synthetic, ...list];
}

export function buildManagerLessonVehiclesForSelect(params: {
    vehicles: readonly Vehicle[];
    selectedVehicleId: string;
    embeddedVehicle?: Vehicle;
    fallbackVehicle?: Vehicle | null;
}): Vehicle[] {
    const list = [...params.vehicles];
    const id = params.selectedVehicleId.trim();

    if (!id || list.some((vehicle) => vehicle.id === id)) {
        return list;
    }

    const embedded =
        params.embeddedVehicle?.id === id ? params.embeddedVehicle : null;
    const fallback = params.fallbackVehicle;
    const synthetic: Vehicle = embedded ?? {
        id,
        name: fallback?.name ?? 'Aktualny pojazd',
        registrationNumber: fallback?.registrationNumber ?? '—',
        status: fallback?.status ?? 'ACTIVE',
        isDefault: fallback?.isDefault ?? false,
        inspectionDate: fallback?.inspectionDate ?? null,
        insuranceDate: fallback?.insuranceDate ?? null,
        modelYear: fallback?.modelYear ?? null,
        mileageKm: fallback?.mileageKm ?? null,
    };

    return [synthetic, ...list];
}

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

    async function loadVehicleDisplayFallback(
        vehicleId: string | null | undefined,
    ): Promise<void> {
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
            vehicleDisplayFallback.value = await options.fetchVehicleById(id);
        } catch {
            vehicleDisplayFallback.value = null;
        }
    }

    async function loadInstructorNameFallback(
        instructorId: string,
    ): Promise<void> {
        const id = instructorId.trim();

        if (!id) {
            instructorNameFallback.value = null;

            return;
        }

        try {
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(
                    `/api/instructors/${encodeURIComponent(id)}`,
                ),
                {
                    method: 'GET',
                    credentials: 'include',
                },
            );

            const data = unwrapApiSuccessData<unknown>(raw);
            const normalized = parseInstructorListItemFromApi(data);

            if (normalized) {
                instructorNameFallback.value =
                    formatInstructorDisplayName(normalized);

                return;
            }
        } catch {
            instructorNameFallback.value = null;
        }
    }

    async function loadStudentDisplayName(
        lesson: ManagerLessonDetail,
    ): Promise<void> {
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
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(
                    `/api/students/${encodeURIComponent(userId)}?${qs.toString()}`,
                ),
                {
                    method: 'GET',
                    credentials: 'include',
                },
            );

            const data = unwrapApiSuccessData<unknown>(raw);
            const detail: StudentDetail | null = normalizeStudentDetail(data);

            if (detail) {
                studentDisplayName.value = formatStudentDisplayName(detail);

                return;
            }
        } catch {
            /* fallback below */
        }

        studentDisplayName.value =
            userId.length > 12 ? `${userId.slice(0, 8)}…` : userId;
    }

    async function loadVehicles(): Promise<void> {
        const schoolId = options.schoolId.value;

        vehiclesError.value = null;
        vehicles.value = [];

        if (!schoolId) {
            return;
        }

        isVehiclesLoading.value = true;

        try {
            vehicles.value = await options.fetchVehiclesList(schoolId);
        } catch (err: unknown) {
            vehiclesError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy pojazdów.',
            );
        } finally {
            isVehiclesLoading.value = false;
        }
    }

    async function loadInstructors(): Promise<void> {
        const schoolId = options.schoolId.value;

        instructorsError.value = null;
        instructors.value = [];

        if (!schoolId) {
            return;
        }

        isInstructorsLoading.value = true;

        try {
            instructors.value = await options.fetchInstructorsList(schoolId);
        } catch (err: unknown) {
            instructorsError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy instruktorów.',
            );
        } finally {
            isInstructorsLoading.value = false;
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
            return formatInstructorDisplayName(fromList);
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
