<script setup lang="ts">
import { ArrowLeft, CalendarDays, GraduationCap, Plus } from 'lucide-vue-next';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Dodawanie instruktora',
    description: () =>
        'Ten adres przekierowuje do listy instruktorów z modalem tworzenia.',
});

const route = useRoute();
const redirectDelayMs = 1400;
let redirectTimer: number | undefined;

const instructorsListRoute = computed(() => ({
    path: '/manager/instructors',
    query: route.query,
}));

function goToInstructorsList() {
    void navigateTo(instructorsListRoute.value, { replace: true });
}

onMounted(() => {
    redirectTimer = window.setTimeout(goToInstructorsList, redirectDelayMs);
});

onBeforeUnmount(() => {
    if (redirectTimer) {
        window.clearTimeout(redirectTimer);
    }
});
</script>

<template>
    <div class="flex min-h-[calc(100svh-8rem)] flex-col gap-12">
        <PageHeader
            title="Dodawanie instruktora"
            description="Ten adres przekierowuje do listy instruktorów z modalem tworzenia."
        >
            <template #actions>
                <UiButton
                    variant="outline"
                    type="button"
                    class="bg-background h-10 rounded-xl px-4 font-semibold shadow-sm"
                    disabled
                    aria-label="Bieżący tydzień"
                >
                    <CalendarDays class="size-4" aria-hidden="true" />
                    22-28 czerwca
                </UiButton>
                <UiButton
                    as-child
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink to="/manager/schedule">
                        <Plus class="size-4" aria-hidden="true" />
                        Dodaj jazdę
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <section
            class="flex flex-1 items-center justify-center px-0 py-8 sm:px-6"
            aria-labelledby="instructorRedirectTitle"
        >
            <div
                class="border-border bg-card flex w-full max-w-lg flex-col items-center rounded-xl border p-6 text-center shadow-2xl shadow-slate-200/70 sm:p-8"
                role="status"
                aria-live="polite"
            >
                <span
                    class="bg-primary/10 text-primary mb-5 flex size-10 items-center justify-center rounded-xl"
                    aria-hidden="true"
                >
                    <GraduationCap class="size-5" />
                </span>

                <div class="flex flex-col gap-2">
                    <h1
                        id="instructorRedirectTitle"
                        class="text-foreground text-2xl leading-tight font-bold tracking-tight"
                    >
                        Dodawanie instruktora
                    </h1>
                    <p class="text-muted-foreground text-sm leading-relaxed">
                        Ten adres przekierowuje do listy instruktorów z modalem
                        tworzenia.
                    </p>
                </div>

                <ActionGroup
                    label="Akcje przekierowania do listy instruktorów"
                    class="mt-6 justify-center"
                >
                    <UiButton variant="outline" as-child>
                        <NuxtLink :to="instructorsListRoute">
                            <ArrowLeft class="size-4" aria-hidden="true" />
                            Powrót
                        </NuxtLink>
                    </UiButton>
                    <UiButton type="button" @click="goToInstructorsList">
                        Otwórz listę
                    </UiButton>
                </ActionGroup>
            </div>
        </section>
    </div>
</template>
