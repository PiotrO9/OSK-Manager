<template>
    <div class="bg-background min-h-dvh">
        <header
            class="border-border bg-background/95 sticky top-0 z-20 border-b"
        >
            <div
                class="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6"
            >
                <NuxtLink
                    to="/design-system"
                    class="focus-visible:ring-primary inline-flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    aria-label="Design system"
                >
                    <span
                        class="bg-secondary-950 text-primary-50 flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                        aria-hidden="true"
                    >
                        OM
                    </span>
                    <span class="text-foreground truncate text-sm font-bold">
                        Design system
                    </span>
                </NuxtLink>

                <NuxtLink
                    to="/"
                    class="text-muted-foreground hover:text-primary focus-visible:ring-primary rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                    Wróć do panelu
                </NuxtLink>
            </div>
        </header>

        <main
            class="mx-auto w-full max-w-7xl min-w-0 overflow-x-hidden px-4 py-6 md:px-6 md:py-8"
        >
            <slot />
        </main>
    </div>
</template>
