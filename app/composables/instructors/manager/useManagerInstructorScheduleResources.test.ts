import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import type { Vehicle } from '~/types/vehicles/vehicle';

const fetchVehiclesList = vi.fn();
const fetchCoursesList = vi.fn();

function deferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

function installNuxtScheduleResourcesGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('useVehiclesApi', () => ({
        fetchList: fetchVehiclesList,
    }));
    vi.stubGlobal('useCoursesApi', () => ({
        fetchList: fetchCoursesList,
    }));
}

function createVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
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
        ...overrides,
    };
}

function createCourse(overrides: Partial<CourseListItem> = {}): CourseListItem {
    return {
        id: 'course-1',
        name: 'Kurs B',
        category: 'B',
        courseType: null,
        type: 'PRACTICAL',
        totalHours: 30,
        instructor: null,
        ...overrides,
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

    it('keeps the latest vehicles response when school changes quickly', async () => {
        const firstLoad = deferred<Vehicle[]>();
        const secondLoad = deferred<Vehicle[]>();
        const schoolId = ref('school-1');

        fetchVehiclesList
            .mockReturnValueOnce(firstLoad.promise)
            .mockReturnValueOnce(secondLoad.promise);

        const { useManagerInstructorScheduleResources } =
            await import('./useManagerInstructorScheduleResources');
        const data = useManagerInstructorScheduleResources({ schoolId });

        const firstPromise = data.loadVehicles();

        schoolId.value = 'school-2';

        const secondPromise = data.loadVehicles();

        secondLoad.resolve([createVehicle()]);
        await secondPromise;

        expect(data.vehicles.value.map((item) => item.id)).toEqual([
            'vehicle-1',
        ]);

        firstLoad.resolve([createVehicle({ id: 'vehicle-old' })]);
        await firstPromise;

        expect(data.vehicles.value.map((item) => item.id)).toEqual([
            'vehicle-1',
        ]);
        expect(data.isVehiclesLoading.value).toBe(false);
    });

    it('keeps the latest courses response when school changes quickly', async () => {
        const firstLoad = deferred<CourseListItem[]>();
        const secondLoad = deferred<CourseListItem[]>();
        const schoolId = ref('school-1');

        fetchCoursesList
            .mockReturnValueOnce(firstLoad.promise)
            .mockReturnValueOnce(secondLoad.promise);

        const { useManagerInstructorScheduleResources } =
            await import('./useManagerInstructorScheduleResources');
        const data = useManagerInstructorScheduleResources({ schoolId });

        const firstPromise = data.loadCourses();

        schoolId.value = 'school-2';

        const secondPromise = data.loadCourses();

        secondLoad.resolve([createCourse()]);
        await secondPromise;

        expect(data.courses.value.map((item) => item.id)).toEqual(['course-1']);

        firstLoad.resolve([createCourse({ id: 'course-old' })]);
        await firstPromise;

        expect(data.courses.value.map((item) => item.id)).toEqual(['course-1']);
        expect(data.isCoursesLoading.value).toBe(false);
    });
});
