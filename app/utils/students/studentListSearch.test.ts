import { describe, expect, it } from 'vitest';
import { buildStudentsListPath } from './studentApiRequests';

describe('student list search requests', () => {
    it('encodes search and combines it with school, course and quick view', () => {
        const path = buildStudentsListPath({
            schoolId: 'school',
            courseId: 'course',
            page: 1,
            limit: 20,
            search: ' Jan +48 ',
            view: 'without-pkk',
        });
        const params = new URL(path, 'http://localhost').searchParams;

        expect(Object.fromEntries(params)).toEqual({
            schoolId: 'school',
            courseId: 'course',
            page: '1',
            limit: '20',
            search: 'Jan +48',
            view: 'without-pkk',
        });
    });
    it('omits empty search and all view to preserve existing consumers', () => {
        expect(
            buildStudentsListPath({
                schoolId: 'school',
                page: 1,
                limit: 20,
                search: ' ',
                view: 'all',
            }),
        ).toBe('/api/students?schoolId=school&page=1&limit=20');
    });
});
