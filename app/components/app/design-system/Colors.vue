<script setup lang="ts">
import {
    DESIGN_SYSTEM_COLOR_FAMILIES,
    DESIGN_SYSTEM_THEME_TOKENS,
    findDesignSystemBaseColor,
} from '~/data/design-system/colors';

const { isDark } = useDarkMode();
const { addToast } = useAppToast();

const families = DESIGN_SYSTEM_COLOR_FAMILIES;
const semanticColors = computed(() =>
    DESIGN_SYSTEM_THEME_TOKENS.map((token) => ({
        name: token.name,
        variable: token.variable,
        value: isDark.value ? token.dark : token.light,
    })),
);

function formatHex(value: string): string {
    return value.toLowerCase();
}

async function copyColor(value: string) {
    const color = formatHex(value);

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(color);
        } else {
            const textarea = document.createElement('textarea');

            textarea.value = color;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.append(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
        }

        addToast({
            title: 'Skopiowano kolor',
            description: color,
            variant: 'success',
            durationMs: 1800,
        });
    } catch {
        addToast({
            title: 'Nie udało się skopiować koloru',
            description: color,
            variant: 'error',
        });
    }
}
</script>

<template>
    <section class="space-y-4" aria-labelledby="colors-heading">
        <div>
            <h3
                id="colors-heading"
                class="text-foreground text-base font-semibold"
            >
                Skale kolorów
            </h3>
            <p class="text-muted-foreground mt-1 text-sm">
                Pełne rodziny do budowania stanów, kontrastu i hierarchii.
                Oznaczenie „bazowy” wskazuje główny odcień danej roli.
            </p>
        </div>

        <div class="border-border bg-card rounded-lg border p-4 md:p-5">
            <div class="overflow-x-auto pb-2">
                <div
                    class="grid min-w-[820px] grid-cols-5 gap-3 xl:min-w-0 xl:gap-4"
                >
                    <article v-for="family in families" :key="family.token">
                        <header class="mb-3 min-h-14">
                            <p class="text-foreground text-sm font-semibold">
                                {{ family.token }}
                            </p>
                            <p class="text-muted-foreground text-xs">
                                {{ family.name }} · {{ family.usage }}
                            </p>
                        </header>

                        <div
                            class="border-border overflow-hidden rounded-md border"
                        >
                            <button
                                v-for="color in family.steps"
                                :key="color.step"
                                type="button"
                                class="focus-visible:ring-ring relative flex h-9 w-full cursor-pointer items-center justify-between gap-2 px-2.5 text-left text-xs font-medium tabular-nums transition-[filter,box-shadow] outline-none hover:brightness-95 focus-visible:z-10 focus-visible:ring-2"
                                :style="{
                                    backgroundColor: color.value,
                                    color: color.foreground,
                                    boxShadow: color.isBase
                                        ? 'inset 0 0 0 2px currentColor'
                                        : undefined,
                                }"
                                :title="`Skopiuj ${formatHex(color.value)}`"
                                @click="copyColor(color.value)"
                            >
                                <span>{{ color.step }}</span>
                                <span class="font-mono">{{
                                    formatHex(color.value)
                                }}</span>
                                <span v-if="color.isBase" class="sr-only"
                                    >Bazowy</span
                                >
                            </button>
                        </div>

                        <button
                            type="button"
                            class="border-border mt-3 flex items-center gap-2 border-t pt-3"
                            :title="`Skopiuj ${formatHex(findDesignSystemBaseColor(family))}`"
                            @click="
                                copyColor(findDesignSystemBaseColor(family))
                            "
                        >
                            <span
                                class="border-border size-7 shrink-0 rounded border"
                                :style="{
                                    backgroundColor:
                                        findDesignSystemBaseColor(family),
                                }"
                                aria-hidden="true"
                            />
                            <div class="min-w-0">
                                <p
                                    class="text-foreground text-xs font-semibold"
                                >
                                    Bazowy
                                </p>
                                <p
                                    class="text-muted-foreground truncate font-mono text-xs"
                                >
                                    {{
                                        formatHex(
                                            findDesignSystemBaseColor(family),
                                        )
                                    }}
                                </p>
                            </div>
                        </button>
                    </article>
                </div>
            </div>

            <div class="border-border mt-4 border-t pt-4">
                <div class="mb-3 flex items-baseline justify-between gap-4">
                    <h4 class="text-foreground text-sm font-semibold">
                        Tokeny interfejsu
                    </h4>
                    <span class="text-muted-foreground text-xs">
                        {{ isDark ? 'Ciemny motyw' : 'Jasny motyw' }}
                    </span>
                </div>
                <div
                    class="grid min-w-0 gap-x-5 gap-y-3 sm:grid-cols-2 xl:grid-cols-3"
                >
                    <button
                        v-for="color in semanticColors"
                        :key="color.variable"
                        type="button"
                        class="focus-visible:ring-ring flex min-w-0 cursor-pointer items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2"
                        :title="`Skopiuj ${formatHex(color.value)}`"
                        @click="copyColor(color.value)"
                    >
                        <span
                            class="border-border size-9 shrink-0 rounded-md border shadow-xs"
                            :style="{ backgroundColor: color.value }"
                            aria-hidden="true"
                        />
                        <div class="min-w-0">
                            <span
                                class="text-foreground block text-xs font-semibold"
                            >
                                {{ color.name }}
                            </span>
                            <span
                                class="text-muted-foreground flex flex-wrap gap-x-2 text-xs"
                            >
                                <code>{{ color.variable }}</code>
                                <span>{{ formatHex(color.value) }}</span>
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>
