<script setup lang="ts">
const route = useRoute();

function resolveShellHeading(): string {
    if (route.path === '/manager/osk/new') {
        return 'Nowa szkoła';
    }

    const map: Record<string, string> = {
        '/': 'Pulpit',
        '/design-system': 'Design system',
        '/manager/osk': 'Szkoły jazdy',
        '/account': 'Konto',
        '/events': 'Wydarzenia',
    };

    if (route.path.startsWith('/manager/instructors')) {
        return 'Instruktorzy';
    }

    if (route.path.startsWith('/manager/students')) {
        return 'Kursanci';
    }

    if (route.path.startsWith('/manager/courses')) {
        return 'Kursy';
    }

    if (route.path.startsWith('/manager/schedule')) {
        return 'Harmonogram lekcji';
    }

    if (route.path === '/my-lessons') {
        return 'Moje lekcje';
    }

    if (route.path === '/my-courses') {
        return 'Moje kursy';
    }

    if (route.path === '/my-payments') {
        return 'Moje opłaty';
    }

    if (route.path === '/book-lesson') {
        return 'Rezerwuj jazde';
    }

    return map[route.path] ?? 'Panel';
}

const heading = computed(() => resolveShellHeading());
</script>

<template>
    <UiSidebarProvider
        class="min-h-svh"
        :style="{
            '--sidebar-width': '16rem',
            '--sidebar-width-icon': '3rem',
        }"
    >
        <AppShellSidebar />
        <UiSidebarInset>
            <header
                class="border-border flex h-14 shrink-0 items-center gap-2 border-b px-4"
            >
                <UiSidebarTrigger
                    class="-ml-1"
                    aria-label="Otwórz lub zamknij panel boczny"
                />
                <UiSeparator
                    orientation="vertical"
                    class="mr-2 data-[orientation=vertical]:h-4"
                />
                <p
                    class="text-muted-foreground text-sm font-medium"
                    aria-live="polite"
                >
                    {{ heading }}
                </p>
            </header>
            <div class="flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-4 md:p-6">
                <slot />
            </div>
        </UiSidebarInset>
    </UiSidebarProvider>
</template>
