<script setup lang="ts">
import { Building2, CalendarDays, MapPin } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
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

const activeSchool = computed(
    () => schools.value.find((school) => school.id === schoolId.value) ?? null,
);

const schoolLocationLabel = computed(() => {
    const school = activeSchool.value;

    if (!school) {
        return 'Wybrana szkóła jazdy';
    }

    const parts = [school.city, school.address]
        .map((part) => part?.trim() ?? '')
        .filter((part) => part.length > 0);

    return parts.length > 0 ? parts.join(' · ') : 'Brak adresu w profilu OSK';
});

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
            <template #actions>
                <UiBadge
                    variant="outline"
                    class="bg-background rounded-xl px-3 py-2 text-sm font-semibold"
                >
                    <CalendarDays class="mr-1.5 size-4" aria-hidden="true" />
                    Widok tygodnia
                </UiBadge>
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

        <section
            v-else
            class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            :aria-busy="isSchoolsLoading"
        >
            <div
                class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
            >
                <div class="flex min-w-0 items-center gap-3">
                    <div
                        class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600"
                        aria-hidden="true"
                    >
                        <Building2 class="size-5" />
                    </div>
                    <div class="min-w-0">
                        <p
                            class="text-foreground truncate text-lg font-extrabold"
                        >
                            {{
                                activeSchool?.name ??
                                (isSchoolsLoading
                                    ? 'Wczytywanie OSK...'
                                    : 'Wybrana OSK')
                            }}
                        </p>
                        <p
                            class="text-muted-foreground mt-1 flex min-w-0 items-center gap-1.5 text-sm"
                        >
                            <MapPin
                                class="size-4 shrink-0"
                                aria-hidden="true"
                            />
                            <span class="truncate">{{
                                schoolLocationLabel
                            }}</span>
                        </p>
                    </div>
                </div>

                <div class="grid gap-2 sm:grid-cols-3 lg:min-w-[420px]">
                    <div class="border-border rounded-xl border px-3 py-2">
                        <p class="text-muted-foreground text-xs">Tryb</p>
                        <p class="text-foreground mt-1 font-extrabold">
                            Manager
                        </p>
                    </div>
                    <div class="border-border rounded-xl border px-3 py-2">
                        <p class="text-muted-foreground text-xs">Zakres</p>
                        <p class="text-foreground mt-1 font-extrabold">7 dni</p>
                    </div>
                    <div class="border-border rounded-xl border px-3 py-2">
                        <p class="text-muted-foreground text-xs">Edycja</p>
                        <p class="text-foreground mt-1 font-extrabold">
                            Wlaczona
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <ManagerSchoolScheduleCalendar
            v-if="schoolId && !schoolIdError"
            :school-id="schoolId"
            event-edit-enabled
        />
    </div>
</template>
