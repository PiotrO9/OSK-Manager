<template>
    <Card aria-label="Card: Loader">
        <template #header>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Loader
            </p>
        </template>

        <div class="space-y-6">
            <p class="text-sm text-slate-600 dark:text-slate-400">
                Advanced loader with SVG animations, ideal for displaying during
                module loading or larger sections of the application.
            </p>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Animation variants
                </p>
                <div
                    class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3"
                >
                    <div class="flex flex-col items-center gap-2">
                        <Loader variant="circles" size="md" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Circles</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Loader variant="pulse" size="md" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Pulse</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Loader variant="dots" size="md" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Dots</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Loader variant="wave" size="md" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Wave</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Loader variant="orbit" size="md" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Orbit</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Loader variant="spinner" size="md" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Spinner</span
                        >
                    </div>
                </div>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Sizes
                </p>
                <div class="flex flex-wrap items-center gap-6">
                    <div class="flex flex-col items-center gap-2">
                        <Loader variant="circles" size="sm" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Small</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Loader variant="circles" size="md" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Medium</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Loader variant="circles" size="lg" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Large</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Loader variant="circles" size="xl" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Extra large</span
                        >
                    </div>
                </div>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Z tekstem
                </p>
                <div class="flex flex-col items-center gap-4">
                    <Loader
                        variant="circles"
                        size="lg"
                        text="Loading data..."
                    />
                    <Loader variant="pulse" size="md" text="Please wait..." />
                </div>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Usage example in section
                </p>
                <div
                    class="relative min-h-[200px] rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                >
                    <Loader
                        variant="orbit"
                        size="lg"
                        text="Loading module..."
                        :centered="true"
                    />
                </div>
            </div>
        </div>
    </Card>
</template>
