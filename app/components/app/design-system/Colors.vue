<script setup lang="ts">
interface ColorStep {
    step: string;
    value: string;
    foreground: '#FFFFFF' | '#001219';
    isBase?: boolean;
}

interface ColorFamily {
    name: string;
    token: string;
    usage: string;
    steps: readonly ColorStep[];
}

const families: readonly ColorFamily[] = [
    {
        name: 'Cobalt',
        token: 'Primary',
        usage: 'Akcje i nawigacja',
        steps: [
            { step: '950', value: '#172554', foreground: '#FFFFFF' },
            { step: '900', value: '#1E3A8A', foreground: '#FFFFFF' },
            { step: '800', value: '#1E40AF', foreground: '#FFFFFF' },
            { step: '700', value: '#1D4ED8', foreground: '#FFFFFF' },
            {
                step: '600',
                value: '#2563EB',
                foreground: '#FFFFFF',
                isBase: true,
            },
            { step: '500', value: '#3B82F6', foreground: '#001219' },
            { step: '400', value: '#60A5FA', foreground: '#001219' },
            { step: '300', value: '#93C5FD', foreground: '#001219' },
            { step: '200', value: '#BFDBFE', foreground: '#001219' },
            { step: '100', value: '#DBEAFE', foreground: '#001219' },
            { step: '50', value: '#EFF6FF', foreground: '#001219' },
        ],
    },
    {
        name: 'Orange',
        token: 'Accent',
        usage: 'Uwagi i wyróżnienia',
        steps: [
            { step: '950', value: '#431407', foreground: '#FFFFFF' },
            { step: '900', value: '#7C2D12', foreground: '#FFFFFF' },
            { step: '800', value: '#9A3412', foreground: '#FFFFFF' },
            { step: '700', value: '#C2410C', foreground: '#FFFFFF' },
            { step: '600', value: '#EA580C', foreground: '#FFFFFF' },
            {
                step: '500',
                value: '#F97316',
                foreground: '#001219',
                isBase: true,
            },
            { step: '400', value: '#FB923C', foreground: '#001219' },
            { step: '300', value: '#FDBA74', foreground: '#001219' },
            { step: '200', value: '#FED7AA', foreground: '#001219' },
            { step: '100', value: '#FFEDD5', foreground: '#001219' },
            { step: '50', value: '#FFF7ED', foreground: '#001219' },
        ],
    },
    {
        name: 'Green',
        token: 'Success',
        usage: 'Opłacone i ukończone',
        steps: [
            { step: '950', value: '#052E16', foreground: '#FFFFFF' },
            { step: '900', value: '#14532D', foreground: '#FFFFFF' },
            { step: '800', value: '#166534', foreground: '#FFFFFF' },
            { step: '700', value: '#15803D', foreground: '#FFFFFF' },
            {
                step: '600',
                value: '#16A34A',
                foreground: '#FFFFFF',
                isBase: true,
            },
            { step: '500', value: '#22C55E', foreground: '#001219' },
            { step: '400', value: '#4ADE80', foreground: '#001219' },
            { step: '300', value: '#86EFAC', foreground: '#001219' },
            { step: '200', value: '#BBF7D0', foreground: '#001219' },
            { step: '100', value: '#DCFCE7', foreground: '#001219' },
            { step: '50', value: '#F0FDF4', foreground: '#001219' },
        ],
    },
    {
        name: 'Red',
        token: 'Danger',
        usage: 'Błędy i usuwanie',
        steps: [
            { step: '950', value: '#450A0A', foreground: '#FFFFFF' },
            { step: '900', value: '#7F1D1D', foreground: '#FFFFFF' },
            { step: '800', value: '#991B1B', foreground: '#FFFFFF' },
            { step: '700', value: '#B91C1C', foreground: '#FFFFFF' },
            {
                step: '600',
                value: '#DC2626',
                foreground: '#FFFFFF',
                isBase: true,
            },
            { step: '500', value: '#EF4444', foreground: '#001219' },
            { step: '400', value: '#F87171', foreground: '#001219' },
            { step: '300', value: '#FCA5A5', foreground: '#001219' },
            { step: '200', value: '#FECACA', foreground: '#001219' },
            { step: '100', value: '#FEE2E2', foreground: '#001219' },
            { step: '50', value: '#FEF2F2', foreground: '#001219' },
        ],
    },
    {
        name: 'Graphite',
        token: 'Neutral',
        usage: 'Tekst, tła i granice',
        steps: [
            { step: '950', value: '#121416', foreground: '#FFFFFF' },
            { step: '900', value: '#1B1F22', foreground: '#FFFFFF' },
            { step: '800', value: '#252B30', foreground: '#FFFFFF' },
            { step: '700', value: '#343C42', foreground: '#FFFFFF' },
            { step: '600', value: '#465159', foreground: '#FFFFFF' },
            {
                step: '500',
                value: '#64748B',
                foreground: '#FFFFFF',
                isBase: true,
            },
            { step: '400', value: '#A8B3BA', foreground: '#001219' },
            { step: '300', value: '#CBD5E1', foreground: '#001219' },
            { step: '200', value: '#D6DFE3', foreground: '#001219' },
            { step: '100', value: '#EDF2F4', foreground: '#001219' },
            { step: '50', value: '#F8FAFC', foreground: '#001219' },
        ],
    },
];

const { isDark } = useDarkMode();
const { addToast } = useAppToast();

const semanticColors = computed(() => [
    {
        name: 'Background',
        value: isDark.value ? '#121416' : '#F8FAFC',
        variable: '--background',
    },
    {
        name: 'Surface',
        value: isDark.value ? '#1B1F22' : '#FFFFFF',
        variable: '--card',
    },
    {
        name: 'Text',
        value: isDark.value ? '#EDF2F4' : '#001219',
        variable: '--foreground',
    },
    {
        name: 'Muted',
        value: isDark.value ? '#A8B3BA' : '#64748B',
        variable: '--muted-foreground',
    },
    {
        name: 'Border',
        value: isDark.value ? '#343C42' : '#D6DFE3',
        variable: '--border',
    },
    {
        name: 'Focus',
        value: isDark.value ? '#60A5FA' : '#1D4ED8',
        variable: '--ring',
    },
]);

function baseColor(family: ColorFamily): string {
    return (
        family.steps.find((step) => step.isBase)?.value ??
        family.steps[0]!.value
    );
}

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
                            :title="`Skopiuj ${formatHex(baseColor(family))}`"
                            @click="copyColor(baseColor(family))"
                        >
                            <span
                                class="border-border size-7 shrink-0 rounded border"
                                :style="{ backgroundColor: baseColor(family) }"
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
                                    {{ formatHex(baseColor(family)) }}
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
