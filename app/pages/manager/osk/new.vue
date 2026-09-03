<script setup lang="ts">
import { ArrowLeft, Building2 } from 'lucide-vue-next';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Dodawanie OSK',
    description: () =>
        'Ten adres przekierowuje do listy szkół z modalem tworzenia.',
});

const redirectDelayMs = 1400;
let redirectTimer: number | undefined;

function goToOskList() {
    void navigateTo('/manager/osk', { replace: true });
}

onMounted(() => {
    redirectTimer = window.setTimeout(goToOskList, redirectDelayMs);
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
            title="Dodawanie OSK"
            description="Ten adres przekierowuje do listy szkół z modalem tworzenia."
        />

        <section
            class="flex flex-1 items-center justify-center px-0 py-8 sm:px-6"
            aria-labelledby="oskRedirectTitle"
        >
            <div
                class="border-border bg-card flex w-full max-w-md flex-col items-center rounded-xl border p-6 text-center shadow-2xl shadow-slate-200/70 sm:p-8"
                role="status"
                aria-live="polite"
            >
                <span
                    class="bg-primary/10 text-primary mb-5 flex size-10 items-center justify-center rounded-xl"
                    aria-hidden="true"
                >
                    <Building2 class="size-5" />
                </span>

                <div class="flex flex-col gap-2">
                    <h1
                        id="oskRedirectTitle"
                        class="text-foreground text-2xl leading-tight font-bold tracking-tight"
                    >
                        Dodawanie OSK
                    </h1>
                    <p class="text-muted-foreground text-sm leading-relaxed">
                        Ten adres przekierowuje do listy szkół z modalem
                        tworzenia.
                    </p>
                </div>

                <ActionGroup
                    label="Akcje przekierowania do listy OSK"
                    class="mt-6 justify-center"
                >
                    <UiButton variant="outline" as-child>
                        <NuxtLink to="/manager/osk">
                            <ArrowLeft class="size-4" aria-hidden="true" />
                            Powrót
                        </NuxtLink>
                    </UiButton>
                    <UiButton type="button" @click="goToOskList">
                        Otwórz listę
                    </UiButton>
                </ActionGroup>
            </div>
        </section>
    </div>
</template>
