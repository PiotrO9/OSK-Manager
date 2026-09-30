import type { CurrentUserCourseItem } from '~/types/courses/course';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    filterMyCourses,
    getMyCoursesByStatus,
    getMyCoursesTotalHours,
    sortMyCourses,
    type MyCoursesFilter,
} from '~/utils/courses/myCoursesPage';
import { formatPolishCount } from '~/utils/text/polishPlural';

export interface MyCoursesFilterOption {
    value: MyCoursesFilter;
    label: string;
    count: number;
}

export interface MyCoursesToolbarSummary {
    primary: string;
    secondary: string;
}

export interface MyCoursesEmptyState {
    title: string;
    description: string;
    canResetFilter: boolean;
}

export function useMyCoursesPage() {
    const { fetchMyCourses } = useCoursesApi();

    const courses = ref<CurrentUserCourseItem[]>([]);
    const isLoading = shallowRef(true);
    const errorMessage = shallowRef<string | null>(null);
    const activeFilter = shallowRef<MyCoursesFilter>('ALL');

    const sortedCourses = computed(() => sortMyCourses(courses.value));
    const visibleCourses = computed(() =>
        filterMyCourses(sortedCourses.value, activeFilter.value),
    );
    const activeCount = computed(
        () => getMyCoursesByStatus(courses.value, 'ACTIVE').length,
    );
    const finishedCount = computed(
        () => courses.value.length - activeCount.value,
    );

    const filterOptions = computed<MyCoursesFilterOption[]>(() => [
        { value: 'ALL', label: 'Wszystkie', count: courses.value.length },
        { value: 'ACTIVE', label: 'Aktywne', count: activeCount.value },
        { value: 'FINISHED', label: 'Ukończone', count: finishedCount.value },
    ]);

    const resultLabel = computed(() =>
        formatPolishCount(visibleCourses.value.length, [
            'wynik',
            'wyniki',
            'wyników',
        ]),
    );

    const summary = computed<MyCoursesToolbarSummary>(() => {
        const totalHours = getMyCoursesTotalHours(courses.value);

        return {
            primary: formatPolishCount(courses.value.length, [
                'kurs',
                'kursy',
                'kursów',
            ]),
            secondary: `${formatPolishCount(activeCount.value, ['aktywny', 'aktywne', 'aktywnych'])} · ${totalHours} godz. programu`,
        };
    });

    const emptyState = computed<MyCoursesEmptyState>(() => {
        if (courses.value.length === 0) {
            return {
                title: 'Brak przypisanych kursów',
                description:
                    'Gdy szkoła przypisze Ci kurs, pojawi się tutaj razem z postępem szkolenia.',
                canResetFilter: false,
            };
        }

        return {
            title: 'Brak kursów w tym widoku',
            description: 'Zmień filtr, aby zobaczyć pozostałe kursy.',
            canResetFilter: true,
        };
    });

    async function loadCourses(): Promise<void> {
        errorMessage.value = null;
        isLoading.value = true;

        try {
            courses.value = await fetchMyCourses();
        } catch (err: unknown) {
            courses.value = [];
            errorMessage.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy kursów.',
            );
        } finally {
            isLoading.value = false;
        }
    }

    function handleShowAllCourses(): void {
        activeFilter.value = 'ALL';
    }

    onMounted(() => {
        void loadCourses();
    });

    return {
        activeFilter,
        courses,
        emptyState,
        errorMessage,
        filterOptions,
        handleShowAllCourses,
        isLoading,
        loadCourses,
        resultLabel,
        summary,
        visibleCourses,
    };
}
