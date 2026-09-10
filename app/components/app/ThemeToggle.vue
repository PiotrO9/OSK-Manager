<script setup lang="ts">
import { Monitor, Moon, Sun } from 'lucide-vue-next';

const colorMode = useColorMode();

const isDark = computed(() => colorMode.value === 'dark');
const nextThemeLabel = computed(() =>
    isDark.value ? 'Włącz jasny motyw' : 'Włącz ciemny motyw',
);
const modeIcon = computed(() => {
    if (colorMode.preference === 'system') {
        return Monitor;
    }

    return isDark.value ? Sun : Moon;
});

function toggleTheme() {
    colorMode.preference = isDark.value ? 'light' : 'dark';
}
</script>

<template>
    <ClientOnly>
        <UiButton
            type="button"
            variant="ghost"
            size="icon"
            :aria-label="nextThemeLabel"
            :title="nextThemeLabel"
            @click="toggleTheme"
        >
            <component :is="modeIcon" class="size-4" aria-hidden="true" />
        </UiButton>
        <template #fallback>
            <UiButton
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Przełącz motyw"
                title="Przełącz motyw"
                disabled
            >
                <Monitor class="size-4" aria-hidden="true" />
            </UiButton>
        </template>
    </ClientOnly>
</template>
