<script setup lang="ts">
interface ColorSwatch {
    name: string;
    className: string;
    previewClass: string;
}

interface ColorGroup {
    name: string;
    swatches: ColorSwatch[];
}

const { t } = useI18n();
const { add } = useToast();

const colorGroups = computed<ColorGroup[]>(() => [
    {
        name: 'Slate',
        swatches: [
            {
                name: 'Background',
                className: 'bg-slate-950',
                previewClass: 'bg-slate-950',
            },
            {
                name: 'Surface',
                className: 'bg-slate-900',
                previewClass: 'bg-slate-900',
            },
            {
                name: 'Border',
                className: 'border-slate-800',
                previewClass: 'bg-slate-950 ring-1 ring-slate-800',
            },
            {
                name: 'Text',
                className: 'text-slate-50',
                previewClass: 'bg-slate-50',
            },
        ],
    },
    {
        name: 'Brand',
        swatches: [
            {
                name: 'Primary',
                className: 'bg-sky-500',
                previewClass: 'bg-sky-500',
            },
            {
                name: 'Primary hover',
                className: 'bg-sky-400',
                previewClass: 'bg-sky-400',
            },
            {
                name: 'Ring',
                className: 'ring-sky-400',
                previewClass: 'bg-slate-950 ring-2 ring-sky-400',
            },
            {
                name: 'Link',
                className: 'text-sky-300',
                previewClass: 'bg-sky-300',
            },
        ],
    },
    {
        name: 'Success',
        swatches: [
            {
                name: 'Border',
                className: 'border-emerald-600/60',
                previewClass: 'bg-emerald-500/80',
            },
            {
                name: 'Text',
                className: 'text-emerald-300',
                previewClass: 'bg-emerald-300',
            },
            {
                name: 'Surface',
                className: 'bg-emerald-950/40',
                previewClass: 'bg-emerald-950/60',
            },
            {
                name: 'Solid',
                className: 'bg-emerald-500',
                previewClass: 'bg-emerald-500',
            },
        ],
    },
    {
        name: 'Warning',
        swatches: [
            {
                name: 'Border',
                className: 'border-amber-600/60',
                previewClass: 'bg-amber-500/80',
            },
            {
                name: 'Text',
                className: 'text-amber-300',
                previewClass: 'bg-amber-300',
            },
            {
                name: 'Surface',
                className: 'bg-amber-950/40',
                previewClass: 'bg-amber-950/60',
            },
            {
                name: 'Solid',
                className: 'bg-amber-500',
                previewClass: 'bg-amber-500',
            },
        ],
    },
    {
        name: 'Danger',
        swatches: [
            {
                name: 'Border',
                className: 'border-rose-600/60',
                previewClass: 'bg-rose-500/80',
            },
            {
                name: 'Text',
                className: 'text-rose-300',
                previewClass: 'bg-rose-300',
            },
            {
                name: 'Surface',
                className: 'bg-rose-950/40',
                previewClass: 'bg-rose-950/60',
            },
            {
                name: 'Solid',
                className: 'bg-rose-600',
                previewClass: 'bg-rose-600',
            },
        ],
    },
]);

async function handleCopySwatch(group: ColorGroup, swatch: ColorSwatch) {
    const isCopied = await copyTextToClipboard(swatch.className);

    if (!isCopied) {
        useToast().add({
            title: 'Kopiuj kolor',
            description: `Nie udało się skopiować koloru ${group.name} ${swatch.name}.`,
        });

        return;
    }

    useToast().add({
        title: 'Kolor skopiowany',
        description: `Kolor ${group.name} ${swatch.name} został skopiowany do schowka.`,
    });
}

function handleKeyDownCopySwatch(
    event: KeyboardEvent,
    group: ColorGroup,
    swatch: ColorSwatch,
) {
    if (!isEnterOrSpaceKey(event)) return;

    event.preventDefault();
    void handleCopySwatch(group, swatch);
}
</script>

<template>
    <section aria-label="Colors" class="space-y-4">
        <div
            class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
        >
            <div class="space-y-1">
                <h2 class="text-xl font-bold tracking-tight">Colors</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                    These are example tokens based on Tailwind utility classes.
                </p>
            </div>
        </div>

        <div class="grid min-w-0 gap-4 md:grid-cols-2">
            <Card
                v-for="group in colorGroups"
                :key="group.name"
                :aria-label="`Color group: ${group.name}`"
            >
                <template #header>
                    <div class="flex items-center justify-between gap-3">
                        <p
                            class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                        >
                            {{ group.name }}
                        </p>
                    </div>
                </template>

                <div class="grid gap-3 sm:grid-cols-2">
                    <button
                        v-for="swatch in group.swatches"
                        :key="swatch.name"
                        type="button"
                        tabindex="0"
                        class="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/70 p-3 text-left transition hover:border-slate-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800 dark:bg-slate-800/70 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
                        :aria-label="`Copy ${group.name} ${swatch.name}: ${swatch.className}`"
                        @click="handleCopySwatch(group, swatch)"
                        @keydown="
                            handleKeyDownCopySwatch($event, group, swatch)
                        "
                    >
                        <div class="flex min-w-0 items-center gap-3">
                            <div
                                class="h-10 w-10 flex-none rounded-xl border border-slate-200 dark:border-slate-700"
                                :class="swatch.previewClass"
                                :aria-label="`Color preview ${swatch.name}`"
                                role="img"
                            />
                            <div class="min-w-0">
                                <p
                                    class="truncate text-sm font-semibold text-slate-900 dark:text-slate-50"
                                >
                                    {{ swatch.name }}
                                </p>
                                <p
                                    class="truncate font-mono text-xs text-slate-600 dark:text-slate-400"
                                >
                                    {{ swatch.className }}
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </Card>
        </div>
    </section>
</template>
