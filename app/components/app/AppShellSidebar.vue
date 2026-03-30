<script setup lang="ts">
import type { Component } from 'vue';
import {
    Code2,
    LayoutDashboard,
    LogOut,
    Palette,
    Shield,
} from 'lucide-vue-next';

type NavItem = {
    readonly to: string;
    readonly label: string;
    readonly ariaLabel: string;
    readonly icon: Component;
    readonly tooltip: string;
};

const route = useRoute();
const { session } = useAuthSession();
const { handleLogout } = useLogout();

function getNavItems(): NavItem[] {
    return [
        {
            to: '/',
            label: 'Pulpit',
            ariaLabel: 'Przejdź do pulpitu',
            icon: LayoutDashboard,
            tooltip: 'Pulpit',
        },
        {
            to: '/design-system',
            label: 'Design system',
            ariaLabel: 'Przejdź do strony Design system',
            icon: Palette,
            tooltip: 'Design system',
        },
        {
            to: '/protected',
            label: 'Chronione',
            ariaLabel: 'Przejdź do strefy chronionej',
            icon: Shield,
            tooltip: 'Chronione',
        },
        {
            to: '/api-demo',
            label: 'API — demo',
            ariaLabel: 'Przejdź do demonstracji API',
            icon: Code2,
            tooltip: 'API — demo',
        },
    ];
}

function isNavActive(to: string): boolean {
    if (to === '/') {
        return route.path === '/' || route.path === '';
    }

    return route.path === to || route.path.startsWith(`${to}/`);
}

function handleLogoutClick() {
    handleLogout();
}
</script>

<template>
    <UiSidebar collapsible="icon" variant="inset">
        <UiSidebarHeader>
            <UiSidebarMenu>
                <UiSidebarMenuItem>
                    <UiSidebarMenuButton size="lg" as-child>
                        <NuxtLink
                            to="/"
                            class="flex w-full items-center gap-2"
                            aria-label="Przejdź do strony głównej aplikacji"
                        >
                            <span
                                class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg font-semibold"
                            >
                                OM
                            </span>
                            <div
                                class="grid min-w-0 flex-1 text-left text-sm leading-tight"
                            >
                                <span class="truncate font-semibold">
                                    OSK Manager
                                </span>
                                <span
                                    class="text-muted-foreground truncate text-xs"
                                >
                                    Panel
                                </span>
                            </div>
                        </NuxtLink>
                    </UiSidebarMenuButton>
                </UiSidebarMenuItem>
            </UiSidebarMenu>
        </UiSidebarHeader>

        <UiSidebarContent>
            <UiSidebarGroup>
                <UiSidebarGroupLabel
                    class="text-muted-foreground text-xs font-medium"
                >
                    Nawigacja
                </UiSidebarGroupLabel>
                <UiSidebarGroupContent>
                    <UiSidebarMenu>
                        <UiSidebarMenuItem
                            v-for="item in getNavItems()"
                            :key="item.to"
                        >
                            <UiSidebarMenuButton
                                as-child
                                :tooltip="item.tooltip"
                                :is-active="isNavActive(item.to)"
                            >
                                <NuxtLink
                                    :to="item.to"
                                    :aria-label="item.ariaLabel"
                                    :aria-current="
                                        isNavActive(item.to)
                                            ? 'page'
                                            : undefined
                                    "
                                    class="flex w-full items-center gap-2"
                                >
                                    <component
                                        :is="item.icon"
                                        class="size-4 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <span>{{ item.label }}</span>
                                </NuxtLink>
                            </UiSidebarMenuButton>
                        </UiSidebarMenuItem>
                    </UiSidebarMenu>
                </UiSidebarGroupContent>
            </UiSidebarGroup>
        </UiSidebarContent>

        <UiSidebarFooter>
            <UiSidebarMenu>
                <UiSidebarMenuItem>
                    <div
                        class="text-muted-foreground px-2 pb-2 text-xs group-data-[collapsible=icon]:hidden"
                    >
                        <span class="sr-only">Zalogowany użytkownik:</span>
                        <span
                            class="text-sidebar-foreground block truncate font-medium"
                        >
                            {{ session?.userName ?? 'Użytkownik' }}
                        </span>
                        <span
                            v-if="session?.role"
                            class="block truncate text-[0.7rem] opacity-80"
                        >
                            {{ session.role }}
                        </span>
                    </div>
                </UiSidebarMenuItem>
                <UiSidebarMenuItem>
                    <UiSidebarMenuButton
                        tooltip="Wyloguj"
                        class="text-sidebar-foreground"
                        @click="handleLogoutClick"
                    >
                        <LogOut class="size-4 shrink-0" aria-hidden="true" />
                        <span>Wyloguj</span>
                    </UiSidebarMenuButton>
                </UiSidebarMenuItem>
            </UiSidebarMenu>
        </UiSidebarFooter>

        <UiSidebarRail />
    </UiSidebar>
</template>
