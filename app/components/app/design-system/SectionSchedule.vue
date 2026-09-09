<script setup lang="ts">
import { CalendarDays, Clock3 } from 'lucide-vue-next';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

const lessons: readonly ScheduleLessonItem[] = [
    {
        id: 'lesson-1',
        type: 'PRACTICE',
        status: 'PLANNED',
        startTime: '2026-09-10T08:00:00+02:00',
        endTime: '2026-09-10T09:30:00+02:00',
        student: { id: 's-1', firstName: 'Anna', lastName: 'Kowalska' },
        instructor: { id: 'i-1', firstName: 'Marek', lastName: 'Nowak' },
        vehicle: {
            id: 'v-1',
            name: 'Toyota Yaris',
            registrationNumber: 'EZG 4K21',
        },
    },
    {
        id: 'lesson-2',
        kind: 'instructor_event',
        type: 'THEORY',
        status: 'PLANNED',
        startTime: '2026-09-10T10:00:00+02:00',
        endTime: '2026-09-10T11:30:00+02:00',
        instructor: { id: 'i-2', firstName: 'Joanna', lastName: 'Lis' },
        capacity: 12,
        participantCount: 8,
    },
] as const;

const selectedLessonId = shallowRef<string | null>('lesson-1');
</script>

<template>
    <section class="space-y-5" aria-label="Wzorce harmonogramu">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <UiButton
                    size="icon-sm"
                    variant="outline"
                    aria-label="Poprzedni tydzień"
                    >←</UiButton
                >
                <div>
                    <p class="text-foreground text-sm font-semibold">
                        7–13 września 2026
                    </p>
                    <p class="text-muted-foreground text-xs">
                        Tydzień pracy OSK
                    </p>
                </div>
                <UiButton
                    size="icon-sm"
                    variant="outline"
                    aria-label="Następny tydzień"
                    >→</UiButton
                >
            </div>
            <StatusBadge label="2 zaplanowane" tone="info" subtle />
        </div>

        <div
            class="border-border bg-card hidden overflow-hidden rounded-lg border md:grid md:grid-cols-3"
        >
            <div
                v-for="day in [
                    'Czwartek 10.09',
                    'Piątek 11.09',
                    'Sobota 12.09',
                ]"
                :key="day"
                class="border-border min-w-0 border-r last:border-r-0"
            >
                <div
                    class="border-border bg-muted/30 border-b px-3 py-2 text-center text-xs font-semibold"
                >
                    {{ day }}
                </div>
                <div
                    class="relative h-[250px] bg-[linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[length:100%_62px]"
                >
                    <template v-if="day === 'Czwartek 10.09'">
                        <ManagerScheduleLessonBlock
                            v-for="(lesson, index) in lessons"
                            :key="lesson.id"
                            :lesson="lesson"
                            :top-px="18 + index * 112"
                            :height-px="92"
                            :accessibility-label="
                                lesson.type === 'PRACTICE'
                                    ? 'Jazda praktyczna, Anna Kowalska, 08:00–09:30'
                                    : 'Teoria, 10:00–11:30, 8 z 12 miejsc'
                            "
                            :interactive-classes="
                                selectedLessonId === lesson.id
                                    ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                                    : 'hover:ring-1 hover:ring-primary'
                            "
                            :is-clickable="true"
                            practice-primary-line="student"
                            @select="selectedLessonId = lesson.id"
                            @keydown="
                                ($event.key === 'Enter' ||
                                    $event.key === ' ') &&
                                (selectedLessonId = lesson.id)
                            "
                        />
                    </template>
                    <button
                        v-else-if="day === 'Piątek 11.09'"
                        type="button"
                        class="border-warning-200 bg-warning-50 text-warning-800 absolute inset-x-2 top-20 rounded-md border px-3 py-3 text-left text-xs font-medium"
                    >
                        <span class="flex items-center gap-2"
                            ><Clock3 class="size-4" aria-hidden="true" />
                            Niedostępność · 09:00–12:00</span
                        >
                    </button>
                    <div
                        v-else
                        class="text-muted-foreground flex h-full items-center justify-center px-4 text-center text-xs"
                    >
                        Brak zaplanowanych zajęć
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-2 md:hidden">
            <button
                v-for="lesson in lessons"
                :key="lesson.id"
                type="button"
                class="border-border bg-card focus-visible:ring-ring flex w-full items-start gap-3 rounded-lg border p-3 text-left outline-none focus-visible:ring-2"
                @click="selectedLessonId = lesson.id"
            >
                <span
                    class="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md"
                    ><CalendarDays class="size-4" aria-hidden="true"
                /></span>
                <span class="min-w-0"
                    ><span class="block text-sm font-semibold">{{
                        lesson.type === 'PRACTICE'
                            ? 'Anna Kowalska'
                            : 'Zajęcia teoretyczne'
                    }}</span
                    ><span class="text-muted-foreground mt-1 block text-xs">{{
                        lesson.type === 'PRACTICE'
                            ? '08:00–09:30 · Toyota Yaris'
                            : '10:00–11:30 · 8/12 miejsc'
                    }}</span></span
                >
                <StatusBadge
                    class="ml-auto"
                    :label="lesson.type === 'PRACTICE' ? 'Jazda' : 'Teoria'"
                    :tone="lesson.type === 'PRACTICE' ? 'success' : 'info'"
                    subtle
                />
            </button>
        </div>

        <div
            class="border-warning-200 bg-warning-50 text-warning-800 rounded-lg border px-4 py-3 text-sm"
        >
            Konflikt terminu i brak dostępnego pojazdu muszą być pokazane
            tekstem, nie tylko kolorem.
        </div>
    </section>
</template>
