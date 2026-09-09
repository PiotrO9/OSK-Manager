<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';

const route = useRoute();
const { isDark, toggleDarkMode } = useDarkMode();
const showThemeControl = computed(() => route.path === '/design-system');

useHead({
    bodyAttrs: {
        class: 'osk-design-system',
    },
});
</script>

<template>
    <div class="bg-background min-h-dvh">
        <header
            class="border-border bg-background/95 sticky top-0 z-20 border-b backdrop-blur"
        >
            <div
                class="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6"
            >
                <NuxtLink
                    to="/"
                    class="focus-visible:ring-primary inline-flex min-w-0 items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    aria-label="Przejdź do strony głównej"
                >
                    <span
                        class="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                        aria-hidden="true"
                        >OM</span
                    >
                    <span class="text-foreground truncate text-sm font-semibold"
                        >Design system</span
                    >
                </NuxtLink>
                <div class="flex items-center gap-2">
                    <button
                        v-if="showThemeControl"
                        type="button"
                        class="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex size-9 items-center justify-center rounded-md border outline-none focus-visible:ring-2"
                        :aria-label="
                            isDark ? 'Włącz jasny motyw' : 'Włącz ciemny motyw'
                        "
                        @click="toggleDarkMode"
                    >
                        <Sun v-if="isDark" class="size-4" aria-hidden="true" />
                        <Moon v-else class="size-4" aria-hidden="true" />
                    </button>
                    <NuxtLink
                        to="/"
                        class="text-muted-foreground hover:text-primary focus-visible:ring-primary rounded-md px-2 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2"
                        >Wróć do panelu</NuxtLink
                    >
                </div>
            </div>
        </header>
        <main
            class="mx-auto w-full max-w-[1440px] min-w-0 px-4 py-6 md:px-6 md:py-8"
        >
            <slot />
        </main>
    </div>
</template>
