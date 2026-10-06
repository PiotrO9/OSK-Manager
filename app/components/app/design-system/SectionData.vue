<script setup lang="ts">
import { RotateCcw, Search } from 'lucide-vue-next';
import { formatPolishCount } from '~/utils/text/polishPlural';
import type { SummaryStripItem } from '~/components/app/ui/types';
import { designSystemStudents } from '~/data/design-system/fixtures';

const query = shallowRef('');
const status = shallowRef<'all' | 'active' | 'inactive'>('all');
const scenario = shallowRef('data');

const statusLabel = computed(() => {
    if (status.value === 'active') return 'Aktywni';

    if (status.value === 'inactive') return 'Nieaktywni';

    return 'Wszystkie';
});

const visibleStudents = computed(() => {
    const normalizedQuery = query.value.trim().toLocaleLowerCase('pl-PL');

    if (scenario.value === 'empty' || scenario.value === 'no-results')
        return [];

    return designSystemStudents.filter((student) => {
        const matchesQuery =
            !normalizedQuery ||
            `${student.firstName} ${student.lastName} ${student.email}`
                .toLocaleLowerCase('pl-PL')
                .includes(normalizedQuery);
        const matchesStatus =
            status.value === 'all' ||
            (status.value === 'active' ? student.isActive : !student.isActive);

        return matchesQuery && matchesStatus;
    });
});

function reset() {
    query.value = '';
    status.value = 'all';
    scenario.value = 'data';
}

const summaryItems = computed<SummaryStripItem[]>(() => {
    const unavailable =
        scenario.value === 'loading' || scenario.value === 'error';
    const rows = visibleStudents.value;

    return [
        { label: 'Wyniki', value: unavailable ? '—' : rows.length },
        {
            label: 'Aktywni w wyniku',
            value: unavailable
                ? '—'
                : rows.filter((row) => row.isActive).length,
            tone: 'success',
        },
        {
            label: 'Bez PKK w wyniku',
            value: unavailable
                ? '—'
                : rows.filter((row) => !row.pkkNumber).length,
            tone: 'warning',
        },
        {
            label: 'Nieaktywni w wyniku',
            value: unavailable
                ? '—'
                : rows.filter((row) => !row.isActive).length,
            tone: 'neutral',
        },
    ];
});
</script>

<template>
    <section class="space-y-5" aria-label="Wzorce danych">
        <SummaryStrip :items="summaryItems" />

        <FilterBar
            title="Kursanci"
            :result-label="
                scenario === 'error'
                    ? '—'
                    : formatPolishCount(visibleStudents.length, [
                          'wynik',
                          'wyniki',
                          'wyników',
                      ])
            "
            :is-loading="scenario === 'loading'"
        >
            <div class="relative min-w-[220px] flex-1 sm:max-w-xs">
                <Search
                    class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                />
                <UiInput
                    v-model="query"
                    class="pl-9"
                    placeholder="Szukaj kursanta"
                    aria-label="Szukaj kursanta"
                />
            </div>
            <UiSelect v-model="status">
                <UiSelectTrigger class="w-[150px]" aria-label="Filtr statusu"
                    ><UiSelectValue>{{
                        statusLabel
                    }}</UiSelectValue></UiSelectTrigger
                >
                <UiSelectContent>
                    <UiSelectItem value="all">Wszystkie</UiSelectItem>
                    <UiSelectItem value="active">Aktywni</UiSelectItem>
                    <UiSelectItem value="inactive">Nieaktywni</UiSelectItem>
                </UiSelectContent>
            </UiSelect>
            <template #actions>
                <UiButton variant="ghost" size="sm" @click="reset"
                    ><RotateCcw aria-hidden="true" /> Reset</UiButton
                >
            </template>
        </FilterBar>

        <DesignSystemScenarioControls
            v-model="scenario"
            label="Scenariusz tabeli"
        />

        <DataTableShell
            :is-loading="scenario === 'loading'"
            :error-message="
                scenario === 'error' ? 'Nie udało się pobrać kursantów.' : null
            "
            empty-title="Brak wyników"
            empty-description="Zmień filtry lub wyczyść wyszukiwanie."
            @retry="scenario = 'data'"
        >
            <ManagerStudentsList
                v-if="scenario === 'data' && visibleStudents.length > 0"
                :students="visibleStudents"
                active-school-id="design-system"
                :is-students-loading="false"
                :show-details-link="false"
                @assign-course="() => undefined"
            />
            <EmptyState
                v-else-if="scenario !== 'loading' && scenario !== 'error'"
                :title="
                    scenario === 'empty' ? 'Brak kursantów' : 'Brak wyników'
                "
                :description="
                    scenario === 'empty'
                        ? 'Dodaj pierwszego kursanta do szkoły.'
                        : 'Zmień filtry lub wyczyść wyszukiwanie.'
                "
                class="m-4"
            >
                <template #action
                    ><UiButton size="sm" variant="outline" @click="reset"
                        >Wyczyść filtry</UiButton
                    ></template
                >
            </EmptyState>
        </DataTableShell>
    </section>
</template>
