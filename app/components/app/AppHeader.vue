<script setup lang="ts">
import Switch from '../ui/Switch.vue';

interface NavLink {
    to: string;
    label: string;
    ariaLabel: string;
}

const route = useRoute();
const { t } = useI18n();
const localePath = useLocalePath();
const { isAuthenticated } = useAuthSession();
const { isDark, toggleDarkMode } = useDarkMode();
const { handleLogout } = useLogout();

const switchAriaLabel = computed(() =>
    isDark.value ? t('commonSwitchToLight') : t('commonSwitchToDark'),
);

const navLinks = computed<NavLink[]>(() => [
    { to: localePath('/'), label: t('navHome'), ariaLabel: t('navGoToHome') },
    {
        to: localePath('/design-system'),
        label: t('navDesignSystem'),
        ariaLabel: t('navGoToDesignSystem'),
    },
    {
        to: localePath('/api-demo'),
        label: t('navApiDemo'),
        ariaLabel: t('navGoToApiDemo'),
    },
    {
        to: localePath('/protected'),
        label: t('navProtected'),
        ariaLabel: t('navGoToProtected'),
    },
]);

function linkClass(to: string): string {
    const isActive = route.path === to || route.path === `${to}/`;

    if (isActive)
        return 'bg-secondary-100 text-secondary-900 dark:bg-secondary-800 dark:text-secondary-50';

    return 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-300 dark:hover:bg-secondary-800 dark:hover:text-secondary-50';
}

function handleGoToLogin() {
    navigateTo(localePath('/login'));
}

function handleToggleDarkMode() {
    toggleDarkMode();
}
</script>

<template>
    <header
        class="border-secondary-200 dark:border-secondary-800 dark:bg-secondary-950/80 sticky top-0 z-40 border-b bg-white/80 backdrop-blur"
    >
        <div
            class="mx-auto flex w-full max-w-6xl min-w-0 flex-wrap items-center justify-between gap-2 px-4 py-4 sm:gap-4"
        >
            <div class="flex items-center gap-3">
                <NuxtLink
                    :to="localePath('/')"
                    class="text-secondary-900 hover:bg-secondary-100 focus-visible:ring-primary-400 dark:text-secondary-50 dark:hover:bg-secondary-800 dark:focus-visible:ring-offset-secondary-950 rounded-xl px-3 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    :aria-label="t('navGoToHome')"
                >
                    Frontend Starter
                </NuxtLink>
                <nav
                    class="hidden items-center gap-1 md:flex"
                    :aria-label="t('navMainNavigation')"
                >
                    <NuxtLink
                        v-for="link in navLinks"
                        :key="link.to"
                        :to="link.to"
                        class="focus-visible:ring-primary-400 dark:focus-visible:ring-offset-secondary-950 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        :class="linkClass(link.to)"
                        :aria-label="link.ariaLabel"
                    >
                        {{ link.label }}
                    </NuxtLink>
                </nav>
            </div>

            <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
                <LanguageSwitch />
                <Switch
                    :checked="isDark"
                    :aria-label="switchAriaLabel"
                    left-icon="heroicons:sun"
                    right-icon="heroicons:moon"
                    left-icon-class="text-warning-500 dark:text-warning-200"
                    right-icon-class="text-secondary-600 dark:text-secondary-300"
                    @update:checked="handleToggleDarkMode"
                />
                <Action
                    v-if="isAuthenticated"
                    variant="secondary"
                    :aria-label="t('navLogOut')"
                    @click="handleLogout"
                >
                    {{ t('navLogOut') }}
                </Action>
                <Action
                    v-else
                    variant="secondary"
                    :aria-label="t('navGoToLogin')"
                    @click="handleGoToLogin"
                >
                    {{ t('navLogIn') }}
                </Action>
            </div>
        </div>
    </header>
</template>
