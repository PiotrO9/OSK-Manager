<script setup lang="ts">
import type { Component } from 'vue';
import AppUserIdentity from './AppUserIdentity.vue';
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
    LoaderCircle,
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
const { handleLogout, isLoggingOut } = useLogout();
const { state, isMobile } = useSidebar();

/** Tooltip + as-child wokół linku potrafi zablokować klik; pokazujemy go tylko w trybie ikon (desktop). */
const showNavItemTooltip = computed(
    () => state.value === 'collapsed' && !isMobile.value,
);
const logoutTooltip = computed(() => {
    if (!showNavItemTooltip.value) return undefined;

    return isLoggingOut.value ? 'Wylogowywanie…' : 'Wyloguj';
});

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

const sidebarAvatarSize = computed<32 | 40>(() =>
    state.value === 'collapsed' && !isMobile.value ? 32 : 40,
);

const avatarSrc = computed(() => {
    const raw = session.value?.avatarUrl;

    if (typeof raw !== 'string' || raw.trim() === '') {
        return '';
    }

    return raw.trim();
});
</script>

<template>
    <UiSidebar collapsible="icon" variant="inset">
        <UiSidebarHeader>
            <UiSidebarMenu>
                <UiSidebarMenuItem>
                    <AppUserIdentity
                        :avatar-src="avatarSrc"
                        :initials="userInitials"
                        :name="displayUserLabel"
                        :subtitle="session?.role"
                        :avatar-size="sidebarAvatarSize"
                        avatar-tone="sidebar"
                        :compact="state === 'collapsed' && !isMobile"
                        truncate
                        class="px-2 py-3"
                        :aria-label="`Zalogowany użytkownik: ${displayUserLabel}`"
                    />
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
                    <UiSidebarMenuButton
                        :tooltip="logoutTooltip"
                        class="text-sidebar-foreground cursor-pointer"
                        :aria-busy="isLoggingOut"
                        @click="handleLogoutClick"
                    >
                        <LoaderCircle
                            v-if="isLoggingOut"
                            class="size-4 shrink-0 animate-spin"
                            aria-hidden="true"
                        />
                        <LogOut
                            v-else
                            class="size-4 shrink-0"
                            aria-hidden="true"
                        />
                        <span aria-live="polite">
                            {{ isLoggingOut ? 'Wylogowywanie…' : 'Wyloguj' }}
                        </span>
                    </UiSidebarMenuButton>
                </UiSidebarMenuItem>
            </UiSidebarMenu>
        </UiSidebarFooter>

        <UiSidebarRail />
    </UiSidebar>
</template>
