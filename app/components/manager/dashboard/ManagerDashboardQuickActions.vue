<script setup lang="ts">
import { CalendarDays, GraduationCap, UsersRound } from 'lucide-vue-next';

const actions = [
    {
        label: 'Harmonogram',
        description: 'Lekcje i wydarzenia szkoły',
        to: '/manager/schedule',
        icon: CalendarDays,
    },
    {
        label: 'Kursanci',
        description: 'Profile, kursy i rozliczenia',
        to: '/manager/students',
        icon: UsersRound,
    },
    {
        label: 'Kursy',
        description: 'Oferta i przypisania',
        to: '/manager/courses',
        icon: GraduationCap,
    },
] as const;
</script>

<template>
    <nav
        class="grid gap-3 sm:grid-cols-3"
        aria-label="Najważniejsze obszary zarządzania"
    >
        <NuxtLink
            v-for="action in actions"
            :key="action.to"
            :to="action.to"
            class="border-border bg-card hover:border-primary/35 hover:bg-primary-50/30 focus-visible:ring-primary group flex min-h-20 items-center gap-3 rounded-2xl border p-4 shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            <span
                class="bg-primary-50 text-primary-700 flex size-11 shrink-0 items-center justify-center rounded-xl"
            >
                <component
                    :is="action.icon"
                    class="size-5"
                    aria-hidden="true"
                />
            </span>
            <span class="min-w-0">
                <span class="text-foreground block text-sm font-bold">
                    {{ action.label }}
                </span>
                <span
                    class="text-muted-foreground mt-0.5 block text-xs leading-relaxed"
                >
                    {{ action.description }}
                </span>
            </span>
        </NuxtLink>
    </nav>
</template>
