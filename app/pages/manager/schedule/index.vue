<script setup lang="ts">
import { Building2 } from 'lucide-vue-next';
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

function getSchoolLocationLabel(school: DrivingSchool): string {
    const parts = [school.city, school.address]
        .map((part) => part?.trim() ?? '')
        .filter((part) => part.length > 0);

    return parts.join(' · ');
}

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
    (sid) => {
        schoolIdError.value = null;

        if (!sid) {
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
            <template v-if="schools.length > 1" #actions>
                <UiSelect
                    :model-value="schoolId"
                    :disabled="isSchoolsLoading"
                    @update:model-value="handleSchoolChange(String($event))"
                >
                    <UiSelectTrigger
                        class="bg-card h-10 w-auto min-w-56 gap-2 rounded-xl px-3 font-semibold shadow-xs"
                        aria-label="Wybierz OSK"
                    >
                        <Building2
                            class="text-primary size-4 shrink-0"
                            aria-hidden="true"
                        />
                        <UiSelectValue placeholder="Wybierz OSK" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem
                                v-for="school in schools"
                                :key="school.id"
                                :value="school.id"
                            >
                                <span class="flex min-w-0 flex-col text-left">
                                    <span class="truncate">{{
                                        school.name
                                    }}</span>
                                    <span
                                        v-if="getSchoolLocationLabel(school)"
                                        class="text-muted-foreground truncate text-xs font-normal"
                                    >
                                        {{ getSchoolLocationLabel(school) }}
                                    </span>
                                </span>
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
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
