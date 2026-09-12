import { computed, ref, watch, type Ref } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import {
    filterCourses,
    newCourseFilter,
    normalizeCourseSearch,
    validCourseFilter,
    type CourseFilter,
    type CourseQuickView,
} from '~/utils/courses/courseFilters';

export function useManagerCoursesFilters(
    courses: Ref<CourseListItem[]>,
    schoolId: Ref<string>,
) {
    const search = ref('');
    const quickView = ref<CourseQuickView>('all');
    const category = ref('all');
    const filters = ref<CourseFilter[]>([]);
    const draft = ref(newCourseFilter());
    const error = ref<string | null>(null);
    const page = ref(1);
    const pageSize = 20;
    let nextFilterId = 0;

    const categories = computed(() =>
        [...new Set(courses.value.map((item) => item.category))]
            .sort((a, b) => a.localeCompare(b, 'pl'))
            .map((value) => ({ value, label: value })),
    );
    const instructors = computed(() =>
        [
            ...new Map(
                courses.value.flatMap((item) =>
                    item.instructor
                        ? [
                              [
                                  item.instructor.id,
                                  {
                                      value: item.instructor.id,
                                      label: item.instructor.name,
                                  },
                              ] as const,
                          ]
                        : [],
                ),
            ).values(),
        ].sort((a, b) => a.label.localeCompare(b.label, 'pl')),
    );
    const filteredCourses = computed(() =>
        filterCourses(
            courses.value,
            search.value,
            quickView.value,
            category.value,
            filters.value,
        ),
    );
    const totalPages = computed(() =>
        Math.max(1, Math.ceil(filteredCourses.value.length / pageSize)),
    );
    const visibleCourses = computed(() =>
        filteredCourses.value.slice(
            (page.value - 1) * pageSize,
            page.value * pageSize,
        ),
    );
    const hasActiveFilters = computed(() =>
        Boolean(
            search.value.trim() ||
            quickView.value !== 'all' ||
            category.value !== 'all' ||
            filters.value.length,
        ),
    );

    function startNew() {
        draft.value = newCourseFilter();
        error.value = null;
    }

    function startEdit(id: string) {
        const filter = filters.value.find((item) => item.id === id);

        if (filter) {
            draft.value = { ...filter };
            error.value = null;
        }
    }

    function updateDraft(value: CourseFilter) {
        draft.value = value;
        error.value = null;
    }

    function apply() {
        if (!validCourseFilter(draft.value)) {
            error.value = 'Uzupełnij poprawnie wartość filtra.';

            return;
        }

        const filter = { ...draft.value, value: draft.value.value.trim() };

        if (
            filters.value.some(
                (item) =>
                    item.id !== filter.id &&
                    item.field === filter.field &&
                    item.condition === filter.condition &&
                    normalizeCourseSearch(item.value) ===
                        normalizeCourseSearch(filter.value),
            )
        ) {
            error.value = 'Taki filtr jest już aktywny.';

            return;
        }

        if (!filter.id && filters.value.length >= 8) {
            error.value = 'Możesz dodać maksymalnie 8 filtrów.';

            return;
        }

        if (filter.id)
            filters.value = filters.value.map((item) =>
                item.id === filter.id ? filter : item,
            );
        else
            filters.value = [
                ...filters.value,
                { ...filter, id: `course-filter-${++nextFilterId}` },
            ];

        startNew();
    }

    function remove(id: string) {
        filters.value = filters.value.filter((item) => item.id !== id);
        startNew();
    }

    function clearAdvanced() {
        filters.value = [];
        startNew();
    }

    function clearAll() {
        search.value = '';
        quickView.value = 'all';
        category.value = 'all';
        clearAdvanced();
        page.value = 1;
    }

    watch(
        [search, quickView, category, filters],
        () => {
            page.value = 1;
        },
        { flush: 'sync' },
    );
    watch(schoolId, clearAll);
    watch(totalPages, (value) => {
        page.value = Math.min(page.value, value);
    });

    return {
        search,
        quickView,
        category,
        filters,
        draft,
        error,
        page,
        totalPages,
        categories,
        instructors,
        filteredCourses,
        visibleCourses,
        hasActiveFilters,
        startNew,
        startEdit,
        updateDraft,
        apply,
        remove,
        clearAdvanced,
        clearAll,
    };
}
