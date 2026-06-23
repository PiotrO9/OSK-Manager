<script setup lang="ts">
import {
    CalendarDays,
    Plus,
    RotateCcw,
    SlidersHorizontal,
} from 'lucide-vue-next';
import type { SummaryStripItem } from '~/components/app/ui/types';

const summaryItems: SummaryStripItem[] = [
    { label: 'Kursanci', value: 128 },
    { label: 'Aktywni', value: 94, tone: 'success' },
    { label: 'Do kontaktu', value: 7, tone: 'warning' },
    { label: 'Nowi', value: 12, tone: 'info' },
];

const students = [
    {
        id: 'anna-kowalska',
        name: 'Anna Kowalska',
        detail: 'Kat. B - 18/30 h',
        course: 'Kurs Kat. B',
        status: 'Aktywny',
        tone: 'info' as const,
        activity: 'dzis',
    },
    {
        id: 'pawel-kruk',
        name: 'Pawel Kruk',
        detail: 'PKK uzupelnione',
        course: 'Kurs Kat. A',
        status: 'Do przypisania',
        tone: 'warning' as const,
        activity: 'wczoraj',
    },
    {
        id: 'julia-wisniewska',
        name: 'Julia Wisniewska',
        detail: 'Zalegla rata',
        course: 'Kurs Kat. B',
        status: 'Uwaga',
        tone: 'danger' as const,
        activity: '2 dni temu',
    },
    {
        id: 'michal-lis',
        name: 'Michal Lis',
        detail: 'Egzamin wewnetrzny',
        course: 'Kurs Kat. B',
        status: 'Gotowy',
        tone: 'success' as const,
        activity: '3 dni temu',
    },
];
</script>

<template>
    <section class="space-y-4" aria-labelledby="foundation-patterns-heading">
        <div class="flex flex-col gap-1">
            <StatusBadge label="Foundation" tone="info" subtle />
            <h2
                id="foundation-patterns-heading"
                class="text-foreground text-xl font-bold tracking-tight"
            >
                Wzorce redesignu
            </h2>
            <p class="text-muted-foreground max-w-3xl text-sm leading-relaxed">
                Gotowe elementy do skladania widokow list, szczegolow i
                formularzy bez lokalnego odtwarzania tych samych klas.
            </p>
        </div>

        <div
            class="border-border bg-background rounded-xl border p-4 shadow-xs md:p-5"
        >
            <PageHeader
                title="Kursanci"
                description="Lista kursantow, filtry OSK i szybkie przypisanie kursu."
                eyebrow="Manager"
                :meta="[
                    { label: 'Widok', value: 'lista' },
                    { label: 'Priorytet', value: 'P0', tone: 'warning' },
                ]"
            >
                <template #actions>
                    <UiButton type="button" variant="outline">
                        <CalendarDays aria-hidden="true" />
                        22-28 czerwca
                    </UiButton>
                    <UiButton type="button">
                        <Plus aria-hidden="true" />
                        Dodaj kursanta
                    </UiButton>
                </template>
            </PageHeader>

            <div class="mt-5 space-y-4">
                <SummaryStrip :items="summaryItems" />

                <FilterBar title="Filtry" result-label="4 wyniki">
                    <StatusBadge label="OSK Zgierz" tone="info" subtle />
                    <StatusBadge label="Kurs: wszystkie" subtle />
                    <StatusBadge label="Status: aktywne" subtle />

                    <template #actions>
                        <UiButton type="button" variant="ghost" size="sm">
                            <RotateCcw aria-hidden="true" />
                            Reset
                        </UiButton>
                    </template>
                </FilterBar>

                <DataTableShell
                    title="Tabela kursantow"
                    description="Desktop uzywa tabeli, mobile dostaje liste rekordow."
                    empty-title="Brak kursantow"
                    empty-description="Zmien filtry albo dodaj pierwszego kursanta."
                >
                    <template #toolbar>
                        <UiButton type="button" variant="outline" size="sm">
                            <SlidersHorizontal aria-hidden="true" />
                            Widok
                        </UiButton>
                    </template>

                    <table class="w-full min-w-[760px] text-left text-sm">
                        <thead
                            class="bg-muted/40 text-muted-foreground border-b"
                        >
                            <tr>
                                <th scope="col" class="px-4 py-3 font-semibold">
                                    Nazwa
                                </th>
                                <th scope="col" class="px-4 py-3 font-semibold">
                                    Zakres
                                </th>
                                <th scope="col" class="px-4 py-3 font-semibold">
                                    Status
                                </th>
                                <th scope="col" class="px-4 py-3 font-semibold">
                                    Ostatnia aktywnosc
                                </th>
                                <th scope="col" class="px-4 py-3 font-semibold">
                                    Akcje
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-border divide-y">
                            <tr
                                v-for="student in students"
                                :key="student.id"
                                class="hover:bg-muted/30"
                            >
                                <td class="px-4 py-3">
                                    <p class="text-foreground font-semibold">
                                        {{ student.name }}
                                    </p>
                                    <p class="text-muted-foreground text-xs">
                                        {{ student.detail }}
                                    </p>
                                </td>
                                <td class="text-foreground px-4 py-3">
                                    {{ student.course }}
                                </td>
                                <td class="px-4 py-3">
                                    <StatusBadge
                                        :label="student.status"
                                        :tone="student.tone"
                                    />
                                </td>
                                <td class="text-foreground px-4 py-3">
                                    {{ student.activity }}
                                </td>
                                <td class="px-4 py-3">
                                    <ActionGroup
                                        label="Akcje kursanta"
                                        density="compact"
                                    >
                                        <UiButton
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                        >
                                            Szczegoly
                                        </UiButton>
                                    </ActionGroup>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <template #mobile>
                        <ul class="divide-border divide-y" role="list">
                            <li
                                v-for="student in students"
                                :key="student.id"
                                class="flex flex-col gap-3 p-4"
                            >
                                <div
                                    class="flex items-start justify-between gap-3"
                                >
                                    <div class="min-w-0">
                                        <p
                                            class="text-foreground font-semibold"
                                        >
                                            {{ student.name }}
                                        </p>
                                        <p
                                            class="text-muted-foreground text-sm"
                                        >
                                            {{ student.detail }}
                                        </p>
                                    </div>
                                    <StatusBadge
                                        :label="student.status"
                                        :tone="student.tone"
                                    />
                                </div>
                                <div
                                    class="text-muted-foreground flex flex-wrap gap-2 text-sm"
                                >
                                    <span>{{ student.course }}</span>
                                    <span aria-hidden="true">-</span>
                                    <span>{{ student.activity }}</span>
                                </div>
                                <UiButton
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                >
                                    Szczegoly
                                </UiButton>
                            </li>
                        </ul>
                    </template>

                    <template #pagination>
                        <div
                            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <p
                                class="text-muted-foreground text-sm tabular-nums"
                            >
                                Strona 1 z 1 (4 wyniki)
                            </p>
                            <ActionGroup label="Paginacja" align="end">
                                <UiButton
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled
                                >
                                    Poprzednia
                                </UiButton>
                                <UiButton
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled
                                >
                                    Nastepna
                                </UiButton>
                            </ActionGroup>
                        </div>
                    </template>
                </DataTableShell>
            </div>
        </div>
    </section>
</template>
