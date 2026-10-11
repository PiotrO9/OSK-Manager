import type {
    CreateLessonBody,
    LessonBookingEligibleStudent,
    LessonBookingOptionsPage,
    LessonBookingSlotContext,
} from '~/types/lessons/lessonBooking';
import { normalizeVehiclesList, type Vehicle } from '~/types/vehicles/vehicle';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { buildSlotIsoUTC } from '~/utils/date/weeklyCalendarDates';

export interface LessonBookingModalData {
    students: LessonBookingEligibleStudent[];
    totalPages: number;
    vehicles: Vehicle[];
    availableVehicleIds: string[];
}

export function useLessonBookingApi() {
    const isLoadingModalData = ref(false);
    const isCreating = ref(false);
    const modalError = ref<string | null>(null);

    async function fetchVehiclesForSlot(
        schoolId: string,
        startIso: string,
        endIso: string,
    ): Promise<Vehicle[]> {
        const qs = new URLSearchParams({
            schoolId: schoolId.trim(),
            startTime: startIso,
            endTime: endIso,
        });

        return await requestBffData<Vehicle[]>(
            'GET',
            `/api/vehicles?${qs.toString()}`,
            {
                fallbackMessage: 'Nie udało się pobrać listy pojazdów.',
                normalize: (data) => normalizeVehiclesList(data),
            },
        );
    }

    async function loadModalData(
        ctx: LessonBookingSlotContext,
    ): Promise<LessonBookingModalData> {
        const trimmedSchoolId = ctx.schoolId.trim();

        if (!trimmedSchoolId) {
            return {
                students: [],
                totalPages: 0,
                vehicles: [],
                availableVehicleIds: [],
            };
        }

        const startIso = buildSlotIsoUTC(ctx.date, ctx.startTime);
        const endIso = buildSlotIsoUTC(ctx.date, ctx.endTime);

        isLoadingModalData.value = true;
        modalError.value = null;

        try {
            const [page, vehicles, availableVehicles] = await Promise.all([
                fetchBookingOptions(ctx, '', 1),
                requestBffData<Vehicle[]>(
                    'GET',
                    `/api/vehicles?${new URLSearchParams({ schoolId: trimmedSchoolId }).toString()}`,
                    {
                        fallbackMessage: 'Nie udało się pobrać listy pojazdów.',
                        normalize: (data) => normalizeVehiclesList(data),
                    },
                ),
                fetchVehiclesForSlot(trimmedSchoolId, startIso, endIso),
            ]);

            return {
                students: page.items,
                totalPages: page.totalPages,
                vehicles,
                availableVehicleIds: availableVehicles.map(
                    (vehicle) => vehicle.id,
                ),
            };
        } catch (err: unknown) {
            modalError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać danych do rezerwacji.',
            );

            throw err;
        } finally {
            isLoadingModalData.value = false;
        }
    }

    async function fetchBookingOptions(
        ctx: LessonBookingSlotContext,
        q: string,
        page: number,
    ): Promise<LessonBookingOptionsPage> {
        const instructorIds = ctx.fixedInstructor
            ? [ctx.fixedInstructor.id]
            : ctx.availableInstructors.map((instructor) => instructor.id);

        if (!ctx.schoolId.trim() || !instructorIds.length) {
            return { items: [], total: 0, page, limit: 20, totalPages: 0 };
        }

        const qs = new URLSearchParams({
            schoolId: ctx.schoolId.trim(),
            instructorIds: [...new Set(instructorIds)].join(','),
            q: q.trim(),
            page: String(page),
            limit: '20',
        });

        return await requestBffData<LessonBookingOptionsPage>(
            'GET',
            `/api/lessons/booking-options?${qs.toString()}`,
            {
                fallbackMessage:
                    'Nie udało się pobrać kursantów do rezerwacji.',
            },
        );
    }

    async function createLesson(body: CreateLessonBody): Promise<void> {
        isCreating.value = true;
        modalError.value = null;

        const payload: CreateLessonBody = {
            courseId: body.courseId.trim(),
            studentId: body.studentId.trim(),
            instructorId: body.instructorId.trim(),
            startTime: body.startTime.trim(),
            endTime: body.endTime.trim(),
            lessonType: body.lessonType,
            vehicleId: body.vehicleId.trim(),
        };

        try {
            await requestBffSuccess('POST', '/api/lessons', {
                body: payload,
                fallbackMessage: 'Nie udało się utworzyć rezerwacji.',
            });
        } catch (err: unknown) {
            modalError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się utworzyć rezerwacji.',
            );

            throw err;
        } finally {
            isCreating.value = false;
        }
    }

    return {
        isLoadingModalData: readonly(isLoadingModalData),
        isCreating: readonly(isCreating),
        modalError: readonly(modalError),
        loadModalData,
        fetchBookingOptions,
        createLesson,
    };
}
