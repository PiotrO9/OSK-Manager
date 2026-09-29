<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next';
import RoleDashboardContent from '~/components/dashboard/RoleDashboardContent.vue';

definePageMeta({
    layout: 'app-shell',
});

usePageMeta({
    title: () => 'Pulpit',
    description: () => 'Najważniejsze informacje i działania w OSK Manager.',
});

const { session } = useAuthSession();

const normalizedRole = computed(() =>
    session.value?.role?.trim().toUpperCase(),
);
const isManager = computed(() => normalizedRole.value === 'MANAGER');
const userDashboardRole = computed(() => {
    if (normalizedRole.value === 'STUDENT') return 'STUDENT' as const;

    if (normalizedRole.value === 'INSTRUCTOR') return 'INSTRUCTOR' as const;

    return null;
});
const sessionDrivingSchools = computed(
    () => session.value?.drivingSchools ?? [],
);
</script>

<template>
    <div class="space-y-5 md:space-y-6">
        <header class="space-y-1.5">
            <h1
                class="text-foreground text-2xl leading-tight font-bold tracking-tight text-balance md:text-3xl"
            >
                Witaj{{ session?.userName ? `, ${session.userName}` : '' }}
            </h1>
            <p class="text-muted-foreground text-sm leading-relaxed">
                {{
                    isManager
                        ? 'Najważniejsze sprawy i wolne terminy w Twojej szkole.'
                        : userDashboardRole === 'STUDENT'
                          ? 'Twój kurs, najbliższe zajęcia i rozliczenia w jednym miejscu.'
                          : userDashboardRole === 'INSTRUCTOR'
                            ? 'Dzisiejszy plan, najbliższe zajęcia i opinie kursantów.'
                            : 'Najważniejsze informacje o Twoim koncie.'
                }}
            </p>
        </header>

        <ManagerDashboardContent v-if="isManager" />

        <RoleDashboardContent
            v-else-if="userDashboardRole"
            :role="userDashboardRole"
            :schools="sessionDrivingSchools"
        />

        <section
            v-else
            class="border-border bg-card rounded-2xl border p-5 shadow-sm md:p-6"
            aria-labelledby="dashboard-role-heading"
        >
            <div class="flex items-start gap-4">
                <span
                    class="bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-xl"
                >
                    <ShieldAlert class="size-5" aria-hidden="true" />
                </span>
                <div class="space-y-1">
                    <h2
                        id="dashboard-role-heading"
                        class="text-foreground text-lg font-bold"
                    >
                        Brak dostępnego pulpitu
                    </h2>
                    <p class="text-muted-foreground text-sm leading-relaxed">
                        Twoja rola nie ma jeszcze przypisanego widoku
                        startowego. Skorzystaj z nawigacji lub przejdź do
                        ustawień konta.
                    </p>
                    <UiButton as-child variant="outline" class="mt-3 min-h-11">
                        <NuxtLink to="/account">Przejdź do konta</NuxtLink>
                    </UiButton>
                </div>
            </div>
        </section>
    </div>
</template>
