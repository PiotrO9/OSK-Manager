<script setup lang="ts">
import { appPaths } from '~~/shared/routing/appPaths';
const route = useRoute();

function resolveShellHeading(): string {
    if (route.path === appPaths.managerInstructorNew()) {
        return 'Nowy instruktor';
    }

    if (route.path === appPaths.managerSchoolNew()) {
        return 'Nowa szkoła';
    }

    const map: Record<string, string> = {
        '/': 'Pulpit',
        [appPaths.designSystem()]: 'Design system',
        [appPaths.managerSchools()]: 'Szkoły jazdy',
        [appPaths.account()]: 'Konto',
        [appPaths.events()]: 'Wydarzenia',
    };

    if (route.path.startsWith(appPaths.managerInstructors())) {
        return 'Instruktorzy';
    }

    if (route.path.startsWith(appPaths.managerStudents())) {
        return 'Kursanci';
    }

    if (route.path.startsWith(appPaths.managerCourses())) {
        return 'Kursy';
    }

    if (route.path.startsWith(appPaths.managerSchedule())) {
        return 'Harmonogram lekcji';
    }

    if (route.path === appPaths.myLessons()) {
        return 'Moje lekcje';
    }

    if (route.path === appPaths.myCourses()) {
        return 'Moje kursy';
    }

    if (route.path === appPaths.myPayments()) {
        return 'Moje opłaty';
    }

    if (route.path === appPaths.myReviews()) {
        return 'Moje opinie';
    }

    if (route.path === appPaths.bookLesson()) {
        return 'Rezerwuj jazdę';
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
                <div class="ml-auto flex items-center">
                    <ThemeToggle />
                </div>
            </header>
            <div class="flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-4 md:p-6">
                <slot />
            </div>
        </UiSidebarInset>
    </UiSidebarProvider>
</template>
