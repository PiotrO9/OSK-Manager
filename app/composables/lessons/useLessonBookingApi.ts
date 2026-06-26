import type { CourseListItem } from '~/types/courses/course';
import type {
    CreateLessonBody,
    LessonBookingSlotContext,
    StudentCourseWithKind,
} from '~/types/lessons/lessonBooking';
import {
    normalizeStudentDetail,
    type StudentListItem,
} from '~/types/students/student';
import { normalizeVehiclesList, type Vehicle } from '~/types/vehicles/vehicle';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { buildSlotIsoUTC } from '~/utils/date/weeklyCalendarDates';

export interface LessonBookingModalData {
    students: StudentListItem[];
    vehicles: Vehicle[];
}

export function useLessonBookingApi() {
    const { fetchList } = useStudentsApi();

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
        const sid = ctx.schoolId.trim();

        if (!sid) {
            return { students: [], vehicles: [] };
        }

        const startIso = buildSlotIsoUTC(ctx.date, ctx.startTime);
        const endIso = buildSlotIsoUTC(ctx.date, ctx.endTime);

        isLoadingModalData.value = true;
        modalError.value = null;

        try {
            const [page, vehicles] = await Promise.all([
                fetchList({ schoolId: sid, page: 1, limit: 100 }),
                fetchVehiclesForSlot(sid, startIso, endIso),
            ]);

            return {
                students: page.items,
                vehicles,
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

    async function loadStudentCoursesWithKind(
        userId: string,
        schoolId: string,
        schoolCourses: readonly CourseListItem[],
    ): Promise<StudentCourseWithKind[]> {
        const uid = userId.trim();
        const sid = schoolId.trim();

        if (!uid || !sid) {
            return [];
        }

        const qs = new URLSearchParams({ schoolId: sid });
        const detail = await requestBffData(
            'GET',
            `/api/students/${encodeURIComponent(uid)}?${qs.toString()}`,
            {
                fallbackMessage: 'Nie udało się pobrać danych kursanta.',
                invalidMessage: 'Nieprawidłowa odpowiedź serwera (kursant).',
                normalize: normalizeStudentDetail,
            },
        );
        const byId = new Map(schoolCourses.map((c) => [c.id, c]));

        return detail.courses.map((c) => {
            const meta = byId.get(c.id);

            return {
                id: c.id,
                name: c.name,
                category: c.category,
                status: c.status,
                kind: meta?.type ?? null,
            };
        });
    }

    async function createLesson(body: CreateLessonBody): Promise<void> {
        isCreating.value = true;
        modalError.value = null;

        const payload: Record<string, unknown> = {
            courseId: body.courseId.trim(),
            studentId: body.studentId.trim(),
            instructorId: body.instructorId.trim(),
            startTime: body.startTime.trim(),
            endTime: body.endTime.trim(),
            lessonType: body.lessonType,
            vehicleId: body.vehicleId.trim(),
        };

        try {
            await requestBffData<unknown>('POST', '/api/lessons', {
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
        loadStudentCoursesWithKind,
        createLesson,
    };
}
