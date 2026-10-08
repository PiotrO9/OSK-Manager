import type { ComputedRef, Ref } from 'vue';
import {
    formatInstructorDisplayName,
    instructorHasCourseCategoryQualification,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import type { CourseDetail } from '~/types/courses/course';
import type { InstructorEvent } from '~/types/events/instructorEvent';
import type { Vehicle } from '~/types/vehicles/vehicle';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { getManagerEventEditErrorStatusCode } from '~/composables/events/managerEventEditErrors';

type EventTypeRef = Ref<'THEORY' | 'DRIVE'>;

export function useManagerEventEditData(input: {
    eventId: ComputedRef<string>;
    schoolId: ComputedRef<string>;
    loadedEvent: Ref<InstructorEvent | null>;
    formType: EventTypeRef;
    formInstructorId: Ref<string>;
    applyPrefill: (ev: InstructorEvent) => void;
}) {
    const { fetchEventById, fetchTheoryEventEligibleStudents, isFetchLoading } =
        useInstructorEventsApi();
    const { fetchList: fetchVehiclesList } = useVehiclesApi();
    const { fetchList: fetchInstructorsList } = useInstructorsApi();
    const { fetchById: fetchCourseById } = useCoursesApi();

    const loadError = ref<string | null>(null);
    const notFound = ref(false);
    const vehicles = ref<Vehicle[]>([]);
    const vehiclesError = ref<string | null>(null);
    const isVehiclesLoading = ref(false);
    const instructors = ref<InstructorListItem[]>([]);
    const instructorsError = ref<string | null>(null);
    const isInstructorsLoading = ref(false);
    const linkedCourseLabel = ref<string | null>(null);
    const linkedCourse = ref<CourseDetail | null>(null);

    let loadSequence = 0;
    let vehiclesLoadSequence = 0;
    let instructorsLoadSequence = 0;
    let linkedCourseLoadSequence = 0;

    async function loadEvent(): Promise<void> {
        const id = input.eventId.value;

        if (!id) {
            input.loadedEvent.value = null;
            loadError.value = null;
            notFound.value = false;

            return;
        }

        const requestSequence = ++loadSequence;

        loadError.value = null;
        notFound.value = false;
        input.loadedEvent.value = null;

        try {
            const event = await fetchEventById(id);

            if (requestSequence !== loadSequence) {
                return;
            }

            input.loadedEvent.value = event;
            input.applyPrefill(event);
        } catch (err: unknown) {
            if (requestSequence !== loadSequence) {
                return;
            }

            if (getManagerEventEditErrorStatusCode(err) === 404) {
                notFound.value = true;

                return;
            }

            loadError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać wydarzenia.',
            );
        }
    }

    function isLoadedEventDrive(): boolean {
        const event = input.loadedEvent.value;

        if (!event) {
            return false;
        }

        return String(event.type).trim().toUpperCase() === 'DRIVE';
    }

    async function loadVehicles(): Promise<void> {
        const requestSequence = ++vehiclesLoadSequence;

        vehiclesError.value = null;
        vehicles.value = [];

        if (!isLoadedEventDrive()) {
            return;
        }

        const schoolId = input.schoolId.value.trim();

        if (!schoolId) {
            return;
        }

        isVehiclesLoading.value = true;

        try {
            const items = await fetchVehiclesList(schoolId);

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
        const schoolId = input.schoolId.value;
        const requestSequence = ++instructorsLoadSequence;

        instructorsError.value = null;
        instructors.value = [];

        if (!schoolId) {
            return;
        }

        isInstructorsLoading.value = true;

        try {
            const items = await fetchInstructorsList(schoolId);

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

    const qualifiedInstructorsForEvent = computed((): InstructorListItem[] => {
        if (
            input.formType.value !== 'THEORY' ||
            !input.loadedEvent.value?.courseId?.trim()
        ) {
            return instructors.value;
        }

        const course = linkedCourse.value;

        if (!course) {
            return [];
        }

        const categoryCode = course.courseType?.code?.trim() || course.category;

        return instructors.value.filter((instructor) =>
            instructorHasCourseCategoryQualification(instructor, categoryCode),
        );
    });

    const instructorSelectLabel = computed((): string => {
        const id = input.formInstructorId.value.trim();

        if (!id) {
            return '—';
        }

        const fromList = qualifiedInstructorsForEvent.value.find(
            (instructor) => instructor.id === id,
        );

        if (fromList) {
            return formatInstructorDisplayName(fromList);
        }

        const embedded = input.loadedEvent.value?.eventInstructor;

        if (embedded?.id === id) {
            return formatInstructorDisplayName(embedded);
        }

        return id;
    });

    watch(
        input.eventId,
        () => {
            void loadEvent();
        },
        { immediate: true },
    );

    watch(
        input.schoolId,
        () => {
            void loadInstructors();
        },
        { immediate: true },
    );

    watch(
        [input.schoolId, input.loadedEvent],
        () => {
            void loadVehicles();
        },
        { immediate: true },
    );

    watch(
        () =>
            [
                input.loadedEvent.value?.courseId?.trim() ?? '',
                input.schoolId.value.trim(),
            ] as const,
        async ([courseId, schoolId]) => {
            const requestSequence = ++linkedCourseLoadSequence;

            linkedCourseLabel.value = null;
            linkedCourse.value = null;

            if (!courseId || !schoolId) {
                return;
            }

            try {
                const course = await fetchCourseById(courseId);

                if (requestSequence !== linkedCourseLoadSequence) {
                    return;
                }

                linkedCourseLabel.value = course.name.trim() || null;
                linkedCourse.value = course;
            } catch {
                if (requestSequence !== linkedCourseLoadSequence) {
                    return;
                }

                linkedCourseLabel.value = null;
                linkedCourse.value = null;
            }
        },
        { immediate: true },
    );

    return {
        loadError,
        notFound,
        vehicles,
        vehiclesError,
        isVehiclesLoading,
        instructors,
        instructorsError,
        isInstructorsLoading,
        linkedCourseLabel,
        linkedCourse,
        qualifiedInstructorsForEvent,
        instructorSelectLabel,
        isFetchLoading,
        fetchEventById,
        fetchTheoryEventEligibleStudents,
        loadEvent,
    };
}
