<template>
    <Card aria-label="Card: Badge">
        <template #header>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Badge
            </p>
        </template>

        <div class="space-y-6">
            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Variants
                </p>
                <div class="flex flex-wrap items-center gap-3">
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="info">Info</Badge>
                </div>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Sizes
                </p>
                <div class="flex flex-wrap items-center gap-3">
                    <Badge size="sm" variant="primary">Small</Badge>
                    <Badge size="md" variant="primary">Medium</Badge>
                    <Badge size="lg" variant="primary">Large</Badge>
                </div>
            </div>
        </div>
    </Card>
</template>
