import { normalizeInstructorsList } from '~/types/instructors/instructor';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { normalizeStudentListPage } from '~/types/students/student';
import { buildManagerOskStatsSummary } from '~/utils/schools/managerOskPage';
import { requestBffData } from '../core/useApi';

async function fetchManagerOskInstructorCount(
    schoolId: string,
): Promise<number> {
    return await requestBffData<number>(
        'GET',
        `/api/instructors?schoolId=${encodeURIComponent(schoolId)}`,
        {
            fallbackMessage: 'Nie udało się pobrać liczby instruktorów.',
            normalize: (data) => normalizeInstructorsList(data).length,
        },
    );
}

async function fetchManagerOskStudentCount(schoolId: string): Promise<number> {
    const qs = new URLSearchParams({
        schoolId,
        page: '1',
        limit: '1',
    });

    return await requestBffData<number>(
        'GET',
        `/api/students?${qs.toString()}`,
        {
            fallbackMessage: 'Nie udało się pobrać liczby kursantów.',
            normalize: (data) => normalizeStudentListPage(data)?.total ?? 0,
        },
    );
}

export function useManagerOskStats() {
    const statsError = ref<string | null>(null);
    const instructorCount = ref<number | null>(null);
    const studentCount = ref<number | null>(null);
    const isStatsLoading = ref(false);

    async function loadSchoolStats(list: DrivingSchool[]): Promise<void> {
        statsError.value = null;

        if (list.length === 0) {
            instructorCount.value = 0;
            studentCount.value = 0;

            return;
        }

        isStatsLoading.value = true;

        try {
            const [instructorResults, studentResults] = await Promise.all([
                Promise.allSettled(
                    list.map((school) =>
                        fetchManagerOskInstructorCount(school.id),
                    ),
                ),
                Promise.allSettled(
                    list.map((school) =>
                        fetchManagerOskStudentCount(school.id),
                    ),
                ),
            ]);

            const summary = buildManagerOskStatsSummary({
                instructorResults,
                studentResults,
            });

            instructorCount.value = summary.instructorCount;
            studentCount.value = summary.studentCount;

            if (summary.hasRejected) {
                statsError.value = 'Część statystyk OSK nie została wczytana.';
            }
        } finally {
            isStatsLoading.value = false;
        }
    }

    function clearSchoolStats(): void {
        instructorCount.value = null;
        studentCount.value = null;
    }

    return {
        statsError,
        instructorCount,
        studentCount,
        isStatsLoading,
        loadSchoolStats,
        clearSchoolStats,
    };
}
