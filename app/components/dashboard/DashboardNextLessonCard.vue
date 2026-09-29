<script setup lang="ts">
import {
    CalendarClock,
    CarFront,
    ChevronRight,
    UserRound,
} from 'lucide-vue-next';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

const props = defineProps<{
    item: ScheduleLessonItem | null;
    role: 'STUDENT' | 'INSTRUCTOR';
    isLoading: boolean;
}>();

const personLabel = computed(() => {
    const person =
        props.role === 'STUDENT' ? props.item?.instructor : props.item?.student;

    if (!person) return null;

    return `${person.firstName} ${person.lastName}`.trim();
});

const dateLabel = computed(() => {
    if (!props.item) return '';

    const start = new Date(props.item.startTime);
    const end = new Date(props.item.endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';

    const day = new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(start);
    const time = new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${day}, ${time.format(start)}–${time.format(end)}`;
});
</script>

<template>
    <section
        class="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
        aria-labelledby="dashboard-next-lesson-heading"
    >
        <div
            class="border-border flex items-center justify-between border-b p-4 md:p-5"
        >
            <div class="flex items-center gap-3">
                <span
                    class="bg-primary-50 text-primary-700 flex size-11 items-center justify-center rounded-xl"
                >
                    <CalendarClock class="size-5" aria-hidden="true" />
                </span>
                <div>
                    <h2
                        id="dashboard-next-lesson-heading"
                        class="text-foreground text-lg font-bold"
                    >
                        Najbliższe zajęcia
                    </h2>
                    <p class="text-muted-foreground text-xs">
                        Plan na najbliższe 14 dni
                    </p>
                </div>
            </div>
            <NuxtLink
                to="/my-lessons"
                class="text-primary focus-visible:ring-primary inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold hover:underline focus-visible:ring-2 focus-visible:outline-none"
            >
                Wszystkie
                <ChevronRight class="size-4" aria-hidden="true" />
            </NuxtLink>
        </div>

        <div class="p-4 md:p-5">
            <div v-if="isLoading" class="space-y-2" role="status">
                <UiSkeleton class="h-6 w-40" />
                <UiSkeleton class="h-5 w-64 max-w-full" />
            </div>

            <div v-else-if="item" class="space-y-3">
                <div class="flex flex-wrap items-center gap-2">
                    <StatusBadge
                        :label="
                            item.type.toUpperCase() === 'THEORY'
                                ? 'Teoria'
                                : 'Jazda praktyczna'
                        "
                        tone="info"
                        subtle
                    />
                    <span
                        v-if="item.categoryCode"
                        class="text-muted-foreground text-xs font-semibold"
                    >
                        Kat. {{ item.categoryCode }}
                    </span>
                </div>
                <p class="text-foreground text-lg font-bold capitalize">
                    {{ dateLabel }}
                </p>
                <div
                    class="text-muted-foreground flex flex-wrap gap-x-5 gap-y-2 text-sm"
                >
                    <span
                        v-if="personLabel"
                        class="inline-flex items-center gap-1.5"
                    >
                        <UserRound class="size-4" aria-hidden="true" />
                        {{ personLabel }}
                    </span>
                    <span
                        v-if="item.vehicle"
                        class="inline-flex items-center gap-1.5"
                    >
                        <CarFront class="size-4" aria-hidden="true" />
                        {{ item.vehicle.name }} ·
                        {{ item.vehicle.registrationNumber }}
                    </span>
                </div>
            </div>

            <EmptyState
                v-else
                title="Brak zaplanowanych zajęć"
                description="W najbliższych 14 dniach nie ma zajęć w terminarzu."
            />
        </div>
    </section>
</template>
