<script setup lang="ts">
definePageMeta({
    layout: 'design-system',
});

usePageMeta({
    title: () => 'Design system',
    description: () =>
        'Podglad palety Tailwind, komponentow shadcn-vue oraz foundation UI OSK Manager.',
});

const isDialogOpen = ref(false);

function handleOpenDialog() {
    isDialogOpen.value = true;
}

function handleDialogConfirm() {
    const { addToast } = useAppToast();

    addToast({
        title: 'Potwierdzenie',
        description: 'Potwierdzono akcje.',
        variant: 'success',
    });
    isDialogOpen.value = false;
}

function handleDialogCancel() {
    const { addToast } = useAppToast();

    addToast({
        title: 'Anulowanie',
        description: 'Anulowano akcje.',
        variant: 'info',
    });
    isDialogOpen.value = false;
}
</script>

<template>
    <div class="min-w-0 space-y-8 overflow-x-hidden">
        <PageHeader
            title="Komponenty UI"
            description="Podglad wspolnych wzorcow dla redesignu oraz bazowych komponentow shadcn-vue."
            eyebrow="Design system"
            :meta="[
                { label: 'Foundation', value: 'gotowe', tone: 'success' },
                { label: 'Widoki', value: 'manager core', tone: 'info' },
            ]"
        >
            <template #actions>
                <UiButton type="button" variant="outline">
                    22-28 czerwca
                </UiButton>
                <UiButton type="button">Dodaj jazde</UiButton>
            </template>
        </PageHeader>

        <SectionFoundationPatterns />
        <SectionFoundationStates />

        <Typography />

        <section aria-label="Components" class="space-y-4">
            <div class="space-y-1">
                <h2 class="text-xl font-bold tracking-tight">
                    Bazowe komponenty
                </h2>
                <p class="text-muted-foreground max-w-3xl text-sm">
                    Nizszy poziom biblioteki: shadcn-vue i istniejace moduly
                    pomocnicze.
                </p>
            </div>

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
                    <UiDialogTitle>Potwierdz akcje</UiDialogTitle>
                    <UiDialogDescription id="design-system-dialog-desc">
                        To demo dialogu shadcn (Reka UI). Esc lub przycisk
                        zamkniecia zamyka okno.
                    </UiDialogDescription>
                </UiDialogHeader>
                <UiDialogFooter>
                    <UiButton variant="outline" @click="handleDialogCancel">
                        Anuluj
                    </UiButton>
                    <UiButton @click="handleDialogConfirm">
                        Potwierdz
                    </UiButton>
                </UiDialogFooter>
            </UiDialogContent>
        </UiDialog>
    </div>
</template>
