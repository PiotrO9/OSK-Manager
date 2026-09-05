<script setup lang="ts">
import type { Component } from 'vue';
import {
    BookOpen,
    Building2,
    CalendarCheck,
    CalendarClock,
    CalendarDays,
    CalendarPlus,
    Car,
    CreditCard,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    MessageSquareText,
    User,
    Users,
} from 'lucide-vue-next';
import { useSidebar } from '../shadcn/sidebar';
import {
    buildAppShellSidebarNavItems,
    getAppShellUserInitials,
    isAppShellSidebarNavActive,
    type AppShellSidebarNavIconKey,
} from '~/utils/navigation/appShellSidebarNav';

const route = useRoute();
const { session } = useAuthSession();
const { handleLogout } = useLogout();
const { state, isMobile } = useSidebar();

/** Tooltip + as-child wokół linku potrafi zablokować klik; pokazujemy go tylko w trybie ikon (desktop). */
const showNavItemTooltip = computed(
    () => state.value === 'collapsed' && !isMobile.value,
);

const NAV_ICON_BY_KEY: Record<AppShellSidebarNavIconKey, Component> = {
    bookOpen: BookOpen,
    building: Building2,
    calendarCheck: CalendarCheck,
    calendarClock: CalendarClock,
    calendarDays: CalendarDays,
    calendarPlus: CalendarPlus,
    car: Car,
    creditCard: CreditCard,
    graduationCap: GraduationCap,
    layoutDashboard: LayoutDashboard,
    messageSquareText: MessageSquareText,
    user: User,
    users: Users,
};

const navItems = computed(() =>
    buildAppShellSidebarNavItems(session.value?.role).map((item) => ({
        ...item,
        icon: NAV_ICON_BY_KEY[item.iconKey],
    })),
);

function isNavActive(to: string): boolean {
    return isAppShellSidebarNavActive(route.path, to);
}

function handleLogoutClick() {
    handleLogout();
}

const displayUserLabel = computed(
    () => session.value?.userName ?? 'Użytkownik',
);

const userInitials = computed(() =>
    getAppShellUserInitials(displayUserLabel.value),
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
