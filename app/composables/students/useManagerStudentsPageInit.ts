import type { Ref } from 'vue';
import {
    readQueryTruthyFlag,
    readUuidQueryValue,
} from '~/utils/students/managerStudentsPage';

interface SchoolRef {
    id: string;
}

interface UseManagerStudentsPageInitOptions {
    schools: Ref<SchoolRef[]>;
    activeSchoolId: Ref<string>;
    loadSchools: () => Promise<void>;
    loadCoursesForFilter: () => Promise<void>;
    loadStudents: () => Promise<void>;
    openInitialRegisterForm: () => void;
}

export function useManagerStudentsPageInit({
    schools,
    activeSchoolId,
    loadSchools,
    loadCoursesForFilter,
    loadStudents,
    openInitialRegisterForm,
}: UseManagerStudentsPageInitOptions) {
    const route = useRoute();

    const openRegisterFormFromQuery = computed((): boolean => {
        return readQueryTruthyFlag(route.query.register);
    });

    const prefillSchoolId = computed((): string | null => {
        return readUuidQueryValue(route.query.schoolId);
    });

    function resolveInitialActiveSchoolId(): string {
        const pre = prefillSchoolId.value;

        if (pre && schools.value.some((s) => s.id === pre)) {
            return pre;
        }

        return schools.value[0]?.id ?? '';
    }

    onMounted(async () => {
        await loadSchools();
        activeSchoolId.value = resolveInitialActiveSchoolId();

        if (openRegisterFormFromQuery.value) {
            openInitialRegisterForm();
        }

        if (activeSchoolId.value) {
            await Promise.all([loadCoursesForFilter(), loadStudents()]);
        }
    });

    return {
        prefillSchoolId,
        resolveInitialActiveSchoolId,
    };
}
