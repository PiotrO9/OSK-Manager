<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';

definePageMeta({
    layout: false,
});

const mode = useCookie<'light' | 'dark'>('osk-palette-preview-mode', {
    default: () => 'light',
    sameSite: 'lax',
});
const isDark = computed(() => mode.value === 'dark');

usePageMeta({
    title: () => 'Test palety kolorów',
    description: () =>
        'Wizualny podgląd proponowanych palet kolorów dla OSK Manager.',
});
</script>

<template>
    <div class="palette-page" :data-theme="isDark ? 'dark' : 'light'">
        <NuxtLayout name="design-system">
            <div class="min-w-0 space-y-8 overflow-x-hidden">
                <PageHeader
                    title="Test palety kolorów"
                    :description="
                        isDark
                            ? 'Cobalt + Graphite + Orange · inspiracja dark.design / Fey'
                            : 'Cobalt + Graphite + Orange · inspiracja Vibrant Color Fiesta / Coolors'
                    "
                    eyebrow="Kolory"
                >
                    <template #actions>
                        <div
                            class="theme-control"
                            role="group"
                            aria-label="Motyw podglądu"
                        >
                            <button
                                type="button"
                                :aria-pressed="!isDark"
                                @click="mode = 'light'"
                            >
                                <Sun :size="16" aria-hidden="true" /> Jasny
                            </button>
                            <button
                                type="button"
                                :aria-pressed="isDark"
                                @click="mode = 'dark'"
                            >
                                <Moon :size="16" aria-hidden="true" /> Ciemny
                            </button>
                        </div>
                        <UiButton
                            as-child
                            variant="outline"
                            class="bg-background"
                        >
                            <NuxtLink to="/design-system"
                                >Design system</NuxtLink
                            >
                        </UiButton>
                    </template>
                </PageHeader>

                <PalettePreviewShowcase :dark="isDark" />
            </div>
        </NuxtLayout>
    </div>
</template>

<style scoped>
.palette-page {
    --background: #f8fafc;
    --foreground: #001219;
    --card: #ffffff;
    --card-foreground: #001219;
    --muted-foreground: #64748b;
    --primary: #2563eb;
    --palette-focus: #1d4ed8;
    --primary-foreground: #ffffff;
    --border: #d6dfe3;
    --accent: #eff6ff;
    --accent-foreground: #001219;
    color: var(--foreground);
    color-scheme: light;
    letter-spacing: 0;
}

.palette-page[data-theme='dark'] {
    --background: #121416;
    --foreground: #edf2f4;
    --card: #1b1f22;
    --card-foreground: #edf2f4;
    --muted-foreground: #a8b3ba;
    --primary: #2563eb;
    --primary-foreground: #ffffff;
    --palette-focus: #60a5fa;
    --border: #343c42;
    --accent: #252b30;
    --accent-foreground: #edf2f4;
    color-scheme: dark;
}

.theme-control {
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card);
}

.theme-control button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 36px;
    min-width: 92px;
    padding: 6px 12px;
    border-radius: 5px;
    color: var(--muted-foreground);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
}

.theme-control button[aria-pressed='true'] {
    background: var(--primary);
    color: var(--primary-foreground);
}

.theme-control button:focus-visible {
    outline: 2px solid var(--palette-focus);
    outline-offset: 2px;
}
</style>
