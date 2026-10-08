<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const router = useRouter();
const { session } = useAuthSession();
const { fetchList: fetchSchoolsList, isListLoading: isSchoolsLoading } =
    useDrivingSchoolsApi();

const schools = ref<DrivingSchool[]>([]);
const schoolsLoadError = ref<string | null>(null);
const schoolIdError = ref<string | null>(null);

function readSchoolIdFromQuery(): string {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') {
        return '';
    }

    return s.trim();
}

const schoolId = computed((): string => {
    const q = readSchoolIdFromQuery();

    if (q) {
        return q;
    }

    const def = session.value?.defaultOskId;

    return typeof def === 'string' ? def.trim() : '';
});

async function handleSchoolChange(value: string): Promise<void> {
    const nextSchoolId = value.trim();

    if (!nextSchoolId || nextSchoolId === schoolId.value) {
        return;
    }

    await router.replace({
        query: {
            ...route.query,
            schoolId: nextSchoolId,
        },
    });
}

async function loadSchools(): Promise<void> {
    schoolsLoadError.value = null;

    try {
        schools.value = await fetchSchoolsList();
    } catch (err) {
        schools.value = [];
        schoolsLoadError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się pobrać listy OSK.',
        );
    }
}

watch(
    () => schoolId.value,
    (selectedSchoolId) => {
        schoolIdError.value = null;

        if (!selectedSchoolId) {
            schoolIdError.value =
                'Brak identyfikatora szkoły. Dodaj ?schoolId= do adresu lub ustaw domyslna OSK.';
        }
    },
    { immediate: true },
);

onMounted(() => {
    void loadSchools();
});

usePageMeta({
    title: () => 'Harmonogram OSK',
    description: () => 'Tygodniowy plan jazd, teorii i blokow czasu.',
});
</script>

<template>
    <div class="flex flex-col gap-5">
        <PageHeader
            title="Harmonogram OSK"
            description="Tygodniowy plan jazd, teorii i blokow czasu."
        >
            <template v-if="schools.length > 0" #actions>
                <div class="min-w-56">
                    <SchoolContextSelect
                        v-if="schools.length > 1"
                        id="schedule-school"
                        :schools="schools"
                        :model-value="schoolId"
                        :disabled="isSchoolsLoading"
                        @update:model-value="handleSchoolChange"
                    />
                    <SchoolContext v-else :school="schools[0] ?? null" />
                </div>
            </template>
        </PageHeader>

        <ErrorState
            v-if="schoolIdError"
            title="Nie wybrano OSK"
            :description="schoolIdError"
        >
            <template #action>
                <UiButton as-child variant="outline" size="sm">
                    <NuxtLink to="/manager/osk">Przejdz do OSK</NuxtLink>
                </UiButton>
            </template>
        </ErrorState>

        <ErrorState
            v-else-if="schoolsLoadError"
            title="Nie udało się wczytać danych OSK"
            :description="schoolsLoadError"
            @retry="loadSchools"
        />

        <ManagerSchoolScheduleCalendar
            v-if="schoolId && !schoolIdError"
            :school-id="schoolId"
            event-edit-enabled
            group-same-start
        />
    </div>
</template>
