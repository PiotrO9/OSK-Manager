import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref, shallowRef } from 'vue';
import type { CourseDetail } from '~/types/courses/course';

import { useManagerCourseDetailData } from './useManagerCourseDetailData';

function installVueGlobals() {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('shallowRef', shallowRef);
}

function course(overrides: Partial<CourseDetail> = {}): CourseDetail {
    return {
        id: 'course-1',
        schoolId: 'school-1',
        name: 'Kurs B',
        category: 'B',
        courseType: { id: 'type-b', code: 'B', name: 'Kategoria B' },
        type: 'PRACTICAL',
        totalHours: 30,
        capacity: null,
        instructor: null,
        ...overrides,
    };
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

describe('useManagerCourseDetailData', () => {
    beforeEach(() => {
        installVueGlobals();
    });

    it('loads course by normalized route id and runs lifecycle hooks', async () => {
        const loadedCourse = course();
        const fetchById = vi.fn().mockResolvedValue(loadedCourse);
        const beforeLoad = vi.fn();
        const afterLoad = vi.fn();
        const data = useManagerCourseDetailData({ fetchById });

        await data.loadCourse([' course-1 '], { beforeLoad, afterLoad });

        expect(fetchById).toHaveBeenCalledWith('course-1');
        expect(beforeLoad).toHaveBeenCalledOnce();
        expect(afterLoad).toHaveBeenCalledWith(loadedCourse);
        expect(data.course.value).toEqual(loadedCourse);
        expect(data.loadError.value).toBeNull();
    });

    it('sets not found error and skips hooks when route id is missing', async () => {
        const fetchById = vi.fn();
        const beforeLoad = vi.fn();
        const afterLoad = vi.fn();
        const data = useManagerCourseDetailData({ fetchById });

        await data.loadCourse('', { beforeLoad, afterLoad });

        expect(fetchById).not.toHaveBeenCalled();
        expect(beforeLoad).not.toHaveBeenCalled();
        expect(afterLoad).not.toHaveBeenCalled();
        expect(data.course.value).toBeNull();
        expect(data.loadError.value).toBe('Nie znaleziono kursu.');
    });

    it('maps fetch error into load error', async () => {
        const fetchById = vi.fn().mockRejectedValue({ statusCode: 403 });
        const data = useManagerCourseDetailData({ fetchById });

        await data.loadCourse('course-1');

        expect(data.course.value).toBeNull();
        expect(data.loadError.value).toContain('Brak dost');
        expect(data.loadError.value).toContain('tego kursu.');
    });

    it('ignores stale API response when a newer request resolves first', async () => {
        const first = deferred<CourseDetail>();
        const second = deferred<CourseDetail>();
        const fetchById = vi
            .fn()
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);
        const firstAfterLoad = vi.fn();
        const secondAfterLoad = vi.fn();
        const data = useManagerCourseDetailData({ fetchById });

        const firstLoad = data.loadCourse('course-1', {
            afterLoad: firstAfterLoad,
        });
        const secondLoad = data.loadCourse('course-2', {
            afterLoad: secondAfterLoad,
        });

        second.resolve(course({ id: 'course-2', name: 'Drugi kurs' }));
        await secondLoad;

        first.resolve(course({ id: 'course-1', name: 'Pierwszy kurs' }));
        await firstLoad;

        expect(data.course.value?.id).toBe('course-2');
        expect(firstAfterLoad).not.toHaveBeenCalled();
        expect(secondAfterLoad).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'course-2' }),
        );
    });
});
