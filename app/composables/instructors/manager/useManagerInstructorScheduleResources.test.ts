import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import type { Vehicle } from '~/types/vehicles/vehicle';

const fetchVehiclesList = vi.fn();
const fetchCoursesList = vi.fn();

function installNuxtScheduleResourcesGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('useVehiclesApi', () => ({
        fetchList: fetchVehiclesList,
    }));
    vi.stubGlobal('useCoursesApi', () => ({
        fetchList: fetchCoursesList,
    }));
}

function createVehicle(): Vehicle {
    return {
        id: 'vehicle-1',
        name: 'Toyota Yaris',
        registrationNumber: 'KR1',
        status: 'ACTIVE',
        unavailableUntil: null,
        isDefault: true,
        inspectionDate: null,
        insuranceDate: null,
        modelYear: 2020,
        mileageKm: 12345,
    };
}

function createCourse(): CourseListItem {
    return {
        id: 'course-1',
        name: 'Kurs B',
        category: 'B',
        courseType: null,
        type: 'PRACTICAL',
        totalHours: 30,
        instructor: null,
    };
}

describe('useManagerInstructorScheduleResources', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtScheduleResourcesGlobals();
    });

    it('clears resources and skips API calls without school id', async () => {
        const { useManagerInstructorScheduleResources } =
            await import('./useManagerInstructorScheduleResources');
        const data = useManagerInstructorScheduleResources({
            schoolId: ref(''),
        });

        data.vehicles.value = [createVehicle()];
        data.courses.value = [createCourse()];
        await data.loadResources();

        expect(fetchVehiclesList).not.toHaveBeenCalled();
        expect(fetchCoursesList).not.toHaveBeenCalled();
        expect(data.vehicles.value).toEqual([]);
        expect(data.courses.value).toEqual([]);
        expect(data.vehiclesError.value).toBeNull();
        expect(data.coursesError.value).toBeNull();
    });

    it('loads vehicle and course resources for current school', async () => {
        const vehicle = createVehicle();
        const course = createCourse();

        fetchVehiclesList.mockResolvedValue([vehicle]);
        fetchCoursesList.mockResolvedValue([course]);

        const { useManagerInstructorScheduleResources } =
            await import('./useManagerInstructorScheduleResources');
        const data = useManagerInstructorScheduleResources({
            schoolId: ref('school-1'),
        });

        await data.loadResources();

        expect(fetchVehiclesList).toHaveBeenCalledWith('school-1');
        expect(fetchCoursesList).toHaveBeenCalledWith('school-1');
        expect(data.vehicles.value).toEqual([vehicle]);
        expect(data.courses.value).toEqual([course]);
        expect(data.isVehiclesLoading.value).toBe(false);
        expect(data.isCoursesLoading.value).toBe(false);
    });

    it('exposes vehicle load errors independently from courses', async () => {
        const course = createCourse();

        fetchVehiclesList.mockRejectedValue(new Error('Vehicles API down'));
        fetchCoursesList.mockResolvedValue([course]);

        const { useManagerInstructorScheduleResources } =
            await import('./useManagerInstructorScheduleResources');
        const data = useManagerInstructorScheduleResources({
            schoolId: ref('school-1'),
        });

        await data.loadResources();

        expect(data.vehicles.value).toEqual([]);
        expect(data.vehiclesError.value).toBe('Vehicles API down');
        expect(data.courses.value).toEqual([course]);
        expect(data.coursesError.value).toBeNull();
    });

    it('exposes course load errors independently from vehicles', async () => {
        const vehicle = createVehicle();

        fetchVehiclesList.mockResolvedValue([vehicle]);
        fetchCoursesList.mockRejectedValue(new Error('Courses API down'));

        const { useManagerInstructorScheduleResources } =
            await import('./useManagerInstructorScheduleResources');
        const data = useManagerInstructorScheduleResources({
            schoolId: ref('school-1'),
        });

        await data.loadResources();

        expect(data.vehicles.value).toEqual([vehicle]);
        expect(data.vehiclesError.value).toBeNull();
        expect(data.courses.value).toEqual([]);
        expect(data.coursesError.value).toBe('Courses API down');
    });
});
