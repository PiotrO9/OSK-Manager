<script setup lang="ts">
import { RotateCcw, Search } from 'lucide-vue-next';
import { designSystemStudents } from '~/data/design-system/fixtures';

const query = shallowRef('');
const status = shallowRef<'all' | 'active' | 'inactive'>('all');
const scenario = shallowRef<'data' | 'loading' | 'error'>('data');

const statusLabel = computed(() => {
    if (status.value === 'active') return 'Aktywni';

    if (status.value === 'inactive') return 'Nieaktywni';

    return 'Wszystkie';
});

const visibleStudents = computed(() => {
    const normalizedQuery = query.value.trim().toLocaleLowerCase('pl-PL');

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
</script>

<template>
    <section class="space-y-5" aria-label="Wzorce danych">
        <SummaryStrip
            :items="[
                { label: 'Kursanci', value: designSystemStudents.length },
                { label: 'Aktywni', value: 2, tone: 'success' },
                { label: 'Bez PKK', value: 1, tone: 'warning' },
                { label: 'Nieaktywni', value: 1, tone: 'neutral' },
            ]"
        />

        <FilterBar
            title="Kursanci"
            :result-label="`${visibleStudents.length} wyników`"
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

        <div
            class="flex flex-wrap gap-2"
            role="group"
            aria-label="Scenariusz tabeli"
        >
            <UiButton
                v-for="option in ['data', 'loading', 'error'] as const"
                :key="option"
                size="sm"
                :variant="scenario === option ? 'default' : 'outline'"
                @click="scenario = option"
            >
                {{
                    option === 'data'
                        ? 'Dane'
                        : option === 'loading'
                          ? 'Ładowanie'
                          : 'Błąd'
                }}
            </UiButton>
        </div>

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
                v-else-if="scenario === 'data'"
                title="Brak wyników"
                description="Zmień filtry lub wyczyść wyszukiwanie."
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
