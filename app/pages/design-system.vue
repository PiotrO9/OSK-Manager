<script setup lang="ts">
usePageMeta({
    title: () => 'Design system',
    description: () =>
        'Podgląd palety Tailwind, komponentów shadcn-vue oraz bloków UI startera.',
});

const isDialogOpen = ref(false);

function handleOpenDialog() {
    isDialogOpen.value = true;
}

function handleDialogConfirm() {
    const { addToast } = useAppToast();

    addToast({
        title: 'Potwierdzenie',
        description: 'Potwierdzono akcję.',
        variant: 'success',
    });
    isDialogOpen.value = false;
}

function handleDialogCancel() {
    const { addToast } = useAppToast();

    addToast({
        title: 'Anulowanie',
        description: 'Anulowano akcję.',
        variant: 'info',
    });
    isDialogOpen.value = false;
}
</script>

<template>
    <div class="min-w-0 space-y-8 overflow-x-hidden">
        <section class="space-y-2">
            <h1
                class="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl"
            >
                Design system
            </h1>
            <p class="text-muted-foreground max-w-3xl">
                Paleta Tailwind, typografia oraz komponenty
                <strong class="text-foreground font-semibold"
                    >shadcn-vue</strong
                >
                (prefiks
                <code class="font-mono text-xs">Ui</code>
                ) obok modułów własnych (
                <code class="font-mono text-xs">NavTree</code>
                ,
                <code class="font-mono text-xs">Slider</code>
                Embla, itd.).
            </p>
        </section>

        <Colors />
        <Typography />

        <section aria-label="Components" class="space-y-4">
            <h2 class="text-xl font-bold tracking-tight">Components</h2>

            <div class="grid min-w-0 gap-4 lg:grid-cols-2">
                <SectionActions />
                <SectionFormControls />
                <SectionToasts />
                <SectionDialog @open="handleOpenDialog" />
                <SectionCards />
                <SectionBreadcrumbs />
                <SectionBadge />
                <SectionSkeleton />
                <SectionSpinner />
                <SectionNavTree />
                <SectionNavigationMenubar />
                <SectionSlider />
                <SectionLoader />
            </div>
        </section>

        <UiDialog v-model:open="isDialogOpen">
            <UiDialogContent aria-describedby="design-system-dialog-desc">
                <UiDialogHeader>
                    <UiDialogTitle>Potwierdź akcję</UiDialogTitle>
                    <UiDialogDescription id="design-system-dialog-desc">
                        To demo dialogu shadcn (Reka UI). Esc lub przycisk
                        zamknięcia zamyka okno.
                    </UiDialogDescription>
                </UiDialogHeader>
                <UiDialogFooter>
                    <UiButton variant="outline" @click="handleDialogCancel">
                        Anuluj
                    </UiButton>
                    <UiButton @click="handleDialogConfirm">
                        Potwierdź
                    </UiButton>
                </UiDialogFooter>
            </UiDialogContent>
        </UiDialog>
    </div>
</template>
