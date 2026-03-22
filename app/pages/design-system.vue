<script setup lang="ts">
usePageMeta({
    title: () => 'Design system',
    description: () =>
        'A single place to preview the Tailwind palette and the UI building blocks used in this starter.',
});

const isDialogOpen = ref(false);

function handleOpenDialog() {
    isDialogOpen.value = true;
}

function handleDialogConfirm() {
    const { addToast } = useToast();

    addToast({
        title: 'Potwierdzenie',
        description: 'Potwierdzono akcję.',
        variant: 'success',
    });
}

function handleDialogCancel() {
    const { addToast } = useToast();

    addToast({
        title: 'Anulowanie',
        description: 'Anulowano akcję.',
        variant: 'info',
    });
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
            <p class="max-w-3xl text-slate-700 dark:text-slate-300">
                A single place to preview the Tailwind palette and the UI
                building blocks used in this starter.
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

        <Dialog
            v-model:open="isDialogOpen"
            cancel-text="Cancel"
            confirm-text="Confirm"
            message="This is a demo dialog. Press Escape or click outside to close."
            title="Confirm action"
            @cancel="handleDialogCancel"
            @confirm="handleDialogConfirm"
        />
    </div>
</template>
