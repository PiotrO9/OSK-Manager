import { describe, expect, it } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import { useManagerCoursesFilters } from './useManagerCoursesFilters';

function setup() {
    const scope = effectScope();
    const school = ref('school-a');
    const courses = ref<CourseListItem[]>(
        Array.from({ length: 21 }, (_, i) => ({
            id: String(i),
            name: `Kurs ${i}`,
            category: 'B',
            type: 'PRACTICAL',
            totalHours: i + 1,
            instructor: null,
            courseType: null,
        })),
    );

    return {
        scope,
        school,
        state: scope.run(() => useManagerCoursesFilters(courses, school))!,
    };
}

describe('course filter state', () => {
    it('filters the full list and resets pagination when filters change', () => {
        const { scope, state } = setup();

        expect(state.totalPages.value).toBe(2);
        state.page.value = 2;
        expect(state.visibleCourses.value).toHaveLength(1);
        state.search.value = 'Kurs 20';
        expect(state.page.value).toBe(1);
        expect(state.visibleCourses.value[0]?.id).toBe('20');
        scope.stop();
    });
    it('adds, edits, rejects duplicates and removes advanced filters', () => {
        const { scope, state } = setup();

        state.updateDraft({
            id: '',
            field: 'totalHours',
            condition: 'gte',
            value: '20',
        });
        state.apply();
        expect(state.filteredCourses.value).toHaveLength(2);
        const id = state.filters.value[0]!.id;

        state.startEdit(id);
        state.updateDraft({ ...state.draft.value, value: '21' });
        state.apply();
        expect(state.filteredCourses.value).toHaveLength(1);
        state.updateDraft({
            id: '',
            field: 'totalHours',
            condition: 'gte',
            value: '21',
        });
        state.apply();
        expect(state.error.value).toBe('Taki filtr jest już aktywny.');
        state.remove(id);
        expect(state.filteredCourses.value).toHaveLength(21);
        scope.stop();
    });
    it('clears school-specific rules and pagination when switching OSK', async () => {
        const { scope, school, state } = setup();

        state.search.value = 'Kurs';
        state.category.value = 'A';
        state.updateDraft({
            id: '',
            field: 'instructor',
            condition: 'empty',
            value: '',
        });
        state.apply();
        school.value = 'school-b';
        await nextTick();
        expect(state.hasActiveFilters.value).toBe(false);
        expect(state.page.value).toBe(1);
        expect(state.error.value).toBeNull();
        scope.stop();
    });
});
