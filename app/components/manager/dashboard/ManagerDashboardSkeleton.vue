<template>
    <div
        class="space-y-4 md:space-y-5"
        role="status"
        aria-label="Wczytywanie pulpitu szkoły"
        aria-live="polite"
    >
        <p class="text-muted-foreground text-sm">Ładowanie danych pulpitu…</p>

        <div
            class="border-border bg-card flex flex-col gap-4 rounded-2xl border p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-5"
            aria-hidden="true"
        >
            <div class="flex items-center gap-3">
                <UiSkeleton class="size-10 shrink-0 rounded-xl" />
                <div class="space-y-2">
                    <UiSkeleton class="h-3 w-28" />
                    <UiSkeleton class="h-5 w-48 max-w-full" />
                    <UiSkeleton class="h-3 w-36" />
                </div>
            </div>
            <UiSkeleton class="h-11 w-44 rounded-xl" />
        </div>

        <div class="grid gap-3 sm:grid-cols-3" aria-hidden="true">
            <div
                v-for="action in 3"
                :key="action"
                class="border-border bg-card flex min-h-20 items-center gap-3 rounded-2xl border p-4 shadow-sm"
            >
                <UiSkeleton class="size-11 shrink-0 rounded-xl" />
                <div class="min-w-0 flex-1 space-y-2">
                    <UiSkeleton class="h-4 w-24 max-w-full" />
                    <UiSkeleton class="h-3 w-36 max-w-full" />
                </div>
            </div>
        </div>

        <section
            class="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
            aria-hidden="true"
        >
            <div
                class="border-border flex items-center gap-3 border-b p-4 md:p-5"
            >
                <UiSkeleton class="size-11 shrink-0 rounded-xl" />
                <div class="flex-1 space-y-2">
                    <UiSkeleton class="h-5 w-40 max-w-full" />
                    <UiSkeleton class="h-3 w-64 max-w-full" />
                </div>
            </div>
            <div class="space-y-2 p-4 md:p-5">
                <UiSkeleton class="h-20 w-full rounded-xl" />
                <UiSkeleton class="h-20 w-full rounded-xl" />
            </div>
        </section>

        <section
            class="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
            aria-hidden="true"
        >
            <div
                class="border-border flex items-center gap-3 border-b p-4 md:p-5"
            >
                <UiSkeleton class="size-10 shrink-0 rounded-xl" />
                <div class="flex-1 space-y-2">
                    <UiSkeleton class="h-5 w-52 max-w-full" />
                    <UiSkeleton class="h-3 w-72 max-w-full" />
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 md:p-5">
                <UiSkeleton
                    v-for="day in 4"
                    :key="day"
                    class="h-36 rounded-xl"
                />
            </div>
        </section>
    </div>
</template>
