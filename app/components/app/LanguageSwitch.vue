<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();

const isOpen = ref(false);
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLDivElement | null>(null);

const FLAG_IMAGE_MAP: Record<string, string> = {
    en: '/images/us.webp',
    pl: '/images/pl.webp',
};

function getFlagSrc(localeCode: string): string {
    return FLAG_IMAGE_MAP[localeCode] ?? '';
}

const currentLocale = computed(() =>
    locales.value.find((loc) => loc.code === locale.value),
);

const currentLocaleName = computed(
    () =>
        currentLocale.value?.name?.toUpperCase() ?? locale.value.toUpperCase(),
);

function handleLocaleChange(newLocale: string) {
    if (locale.value === newLocale) {
        closeDropdown();

        return;
    }

    setLocale(newLocale as typeof locale.value);
    closeDropdown();
}

function toggleDropdown() {
    isOpen.value = !isOpen.value;
}

function closeDropdown() {
    isOpen.value = false;
}

function handleTriggerKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleDropdown();
    }

    if (event.key === 'Escape') {
        closeDropdown();
    }
}

function handleOptionKeyDown(event: KeyboardEvent, localeCode: string) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleLocaleChange(localeCode);
    }

    if (event.key === 'Escape') {
        closeDropdown();
    }
}

function handleClickOutside(event: MouseEvent) {
    const target = event.target as Node;

    if (
        isOpen.value &&
        triggerRef.value &&
        !triggerRef.value.contains(target) &&
        panelRef.value &&
        !panelRef.value.contains(target)
    ) {
        closeDropdown();
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div class="relative" role="group" :aria-label="$t('commonSwitchLanguage')">
        <button
            ref="triggerRef"
            type="button"
            :aria-label="`${$t('commonSwitchLanguage')}: ${currentLocale?.name ?? locale}`"
            :aria-expanded="isOpen"
            aria-haspopup="listbox"
            tabindex="0"
            class="bg-secondary-50 hover:bg-secondary-100 focus-visible:ring-primary-400 dark:bg-secondary-800/80 dark:hover:bg-secondary-800 border-secondary-200 dark:border-secondary-700 flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            @click="toggleDropdown"
            @keydown="handleTriggerKeyDown"
        >
            <img
                v-if="getFlagSrc(locale)"
                :src="getFlagSrc(locale)"
                :alt="currentLocale?.name ?? locale"
                class="size-5 shrink-0 rounded-sm object-cover"
                width="20"
                height="20"
            />
            <span
                class="text-secondary-700 dark:text-secondary-200 text-xs font-medium uppercase"
            >
                {{ currentLocaleName }}
            </span>
            <span
                class="text-secondary-500 dark:text-secondary-400 transition-transform"
                :class="{ 'rotate-180': isOpen }"
                aria-hidden="true"
            >
                <Icon
                    name="heroicons:chevron-up"
                    class="size-4"
                    aria-hidden="true"
                />
            </span>
        </button>

        <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
        >
            <div
                v-show="isOpen"
                ref="panelRef"
                role="listbox"
                :aria-label="$t('commonSwitchLanguage')"
                class="border-secondary-200 dark:border-secondary-700 dark:bg-secondary-900 absolute top-full right-0 left-0 z-50 mt-2 rounded-xl border bg-white p-1.5 shadow-lg"
            >
                <div
                    v-for="loc in locales"
                    :key="loc.code"
                    role="option"
                    :aria-selected="locale === loc.code"
                    tabindex="0"
                    class="hover:bg-secondary-50 dark:hover:bg-secondary-800 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition"
                    :class="{
                        'bg-secondary-50 dark:bg-secondary-800/50':
                            locale === loc.code,
                    }"
                    @click="handleLocaleChange(loc.code)"
                    @keydown="(e) => handleOptionKeyDown(e, loc.code)"
                >
                    <img
                        v-if="getFlagSrc(loc.code)"
                        :src="getFlagSrc(loc.code)"
                        :alt="loc.name"
                        class="size-5 shrink-0 rounded-sm object-cover"
                        width="20"
                        height="20"
                    />
                    <span
                        class="text-secondary-700 dark:text-secondary-200 flex-1 text-xs font-medium uppercase"
                    >
                        {{ loc.name?.toUpperCase() ?? loc.code.toUpperCase() }}
                    </span>
                </div>
            </div>
        </Transition>
    </div>
</template>
