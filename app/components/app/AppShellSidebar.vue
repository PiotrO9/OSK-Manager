<script setup lang="ts">
import type { Component } from 'vue';
import {
    Building2,
    Car,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    User,
} from 'lucide-vue-next';
import { useSidebar } from '../shadcn/sidebar';

interface NavItem {
    readonly to: string;
    readonly label: string;
    readonly ariaLabel: string;
    readonly icon: Component;
    readonly tooltip: string;
}

const route = useRoute();
const { session } = useAuthSession();
const { handleLogout } = useLogout();
const { state, isMobile } = useSidebar();

/** Tooltip + as-child wokół linku potrafi zablokować klik; pokazujemy go tylko w trybie ikon (desktop). */
const showNavItemTooltip = computed(
    () => state.value === 'collapsed' && !isMobile.value,
);

const navItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [
        {
            to: '/',
            label: 'Pulpit',
            ariaLabel: 'Przejdź do pulpitu',
            icon: LayoutDashboard,
            tooltip: 'Pulpit',
        },
        {
            to: '/vehicles',
            label: 'Pojazdy',
            ariaLabel: 'Przejdź do listy pojazdów',
            icon: Car,
            tooltip: 'Pojazdy',
        },
        {
            to: '/account',
            label: 'Konto',
            ariaLabel: 'Przejdź do mojego konta',
            icon: User,
            tooltip: 'Konto',
        },
    ];

    if (session.value?.role === 'MANAGER') {
        items.push({
            to: '/manager/osk',
            label: 'OSK',
            ariaLabel: 'Przejdź do zarządzania szkołami jazdy',
            icon: Building2,
            tooltip: 'Szkoły jazdy',
        });
    }

    if (session.value?.role === 'MANAGER' || session.value?.role === 'ADMIN') {
        items.push({
            to: '/manager/instructors',
            label: 'Instruktorzy',
            ariaLabel: 'Przejdź do zarządzania instruktorami',
            icon: GraduationCap,
            tooltip: 'Instruktorzy',
        });
    }

    return items;
});

function isNavActive(to: string): boolean {
    if (to === '/') {
        return route.path === '/' || route.path === '';
    }

    return route.path === to || route.path.startsWith(`${to}/`);
}

function handleLogoutClick() {
    handleLogout();
}

const displayUserLabel = computed(
    () => session.value?.userName ?? 'Użytkownik',
);

function userInitialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return 'U';
    }

    if (parts.length === 1) {
        const w = parts[0] ?? '';

        return w.slice(0, 2).toUpperCase();
    }

    const a = parts[0]?.[0] ?? '';
    const b = parts[1]?.[0] ?? '';
    const pair = `${a}${b}`.toUpperCase();

    return pair || 'U';
}

const userInitials = computed(() =>
    userInitialsFromName(displayUserLabel.value),
);

const avatarSrc = computed(() => {
    const raw = session.value?.avatarUrl;

    if (typeof raw !== 'string' || raw.trim() === '') {
        return '';
    }

    return raw.trim();
});

const avatarImageFailed = ref(false);

watch(avatarSrc, () => {
    avatarImageFailed.value = false;
});

function handleAvatarImageError() {
    avatarImageFailed.value = true;
}

const showAvatarImage = computed(
    () => Boolean(avatarSrc.value) && !avatarImageFailed.value,
);
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
                            v-for="item in navItems"
                            :key="item.to"
                        >
                            <UiSidebarMenuButton
                                as-child
                                :tooltip="
                                    showNavItemTooltip
                                        ? item.tooltip
                                        : undefined
                                "
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
                        class="text-muted-foreground flex items-center gap-2 px-2 pb-2 text-xs"
                    >
                        <span class="sr-only">
                            Zalogowany użytkownik: {{ displayUserLabel }}
                        </span>
                        <div
                            class="border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border"
                            aria-hidden="true"
                        >
                            <img
                                v-if="showAvatarImage"
                                :src="avatarSrc"
                                alt=""
                                class="size-full object-cover"
                                loading="lazy"
                                @error="handleAvatarImageError"
                            />
                            <span
                                v-else
                                class="text-[0.65rem] font-semibold tracking-tight"
                            >
                                {{ userInitials }}
                            </span>
                        </div>
                        <div
                            class="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"
                        >
                            <span
                                class="text-sidebar-foreground block truncate font-medium"
                            >
                                {{ displayUserLabel }}
                            </span>
                            <span
                                v-if="session?.role"
                                class="block truncate text-[0.7rem] opacity-80"
                            >
                                {{ session.role }}
                            </span>
                        </div>
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
