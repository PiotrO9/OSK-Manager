<script setup lang="ts">
import type { CSSProperties } from 'vue';

const props = defineProps<{ dark: boolean }>();

interface PaletteColor {
    name: string;
    hex: string;
    usage: string;
    textClass: string;
}

interface PalettePreview {
    name: string;
    shortName: string;
    description: string;
    verdict: string;
    source?: string;
    primaryForeground?: string;
    primaryHover?: string;
    colors: PaletteColor[];
}

const lightPalettes: PalettePreview[] = [
    {
        name: 'Rekomendowana',
        shortName: 'Cobalt + Graphite + Orange',
        description: 'Kobalt, neutralny grafit i pomarańczowy akcent.',
        verdict: 'Wybór dla OSK',
        source: 'https://coolors.co/ffbe0b-fb5607-ff006e-8338ec-3a86ff',
        primaryForeground: '#FFFFFF',
        primaryHover: '#1D4ED8',
        colors: [
            {
                name: 'Primary',
                hex: '#2563EB',
                usage: 'główne akcje, nawigacja',
                textClass: 'text-white',
            },
            {
                name: 'Accent',
                hex: '#F97316',
                usage: 'ostrzeżenia, wymaga uwagi',
                textClass: 'text-[#001219]',
            },
            {
                name: 'Success',
                hex: '#16A34A',
                usage: 'opłacone, ukończone',
                textClass: 'text-white',
            },
            {
                name: 'Danger',
                hex: '#DC2626',
                usage: 'błędy, zaległości',
                textClass: 'text-white',
            },
            {
                name: 'Background',
                hex: '#F8FAFC',
                usage: 'tło aplikacji',
                textClass: 'text-[#001219]',
            },
            {
                name: 'Surface',
                hex: '#FFFFFF',
                usage: 'formularze, tabele',
                textClass: 'text-[#001219]',
            },
            {
                name: 'Text',
                hex: '#001219',
                usage: 'nagłówki, treści',
                textClass: 'text-white',
            },
            {
                name: 'Muted',
                hex: '#64748B',
                usage: 'opisy, etykiety',
                textClass: 'text-white',
            },
            {
                name: 'Focus',
                hex: '#1D4ED8',
                usage: 'linki, focus pól',
                textClass: 'text-white',
            },
            {
                name: 'Highlight',
                hex: '#EFF6FF',
                usage: 'subtelne wyróżnienia',
                textClass: 'text-[#001219]',
            },
        ],
    },
];

const darkBase: Record<string, string> = {
    Background: '#121416',
    Surface: '#1B1F22',
    Text: '#EDF2F4',
    Muted: '#A8B3BA',
    Success: '#22C55E',
    Danger: '#EF4444',
};

const darkAccents: Record<string, Record<string, string>> = {
    'Cobalt + Graphite + Orange': {
        Primary: '#2563EB',
        Accent: '#F97316',
        Focus: '#60A5FA',
        Highlight: '#1C2D48',
    },
};

const palettes = computed(() =>
    lightPalettes.map((palette) => ({
        ...palette,
        colors: palette.colors.map((color) => ({
            ...color,
            hex: props.dark
                ? (darkAccents[palette.shortName]?.[color.name] ??
                  darkBase[color.name] ??
                  color.hex)
                : color.hex,
        })),
    })),
);

function getSwatchStyle(hex: string): CSSProperties {
    const channels = hex
        .slice(1)
        .match(/.{2}/g)!
        .map((channel) => {
            const value = parseInt(channel, 16) / 255;

            return value <= 0.04045
                ? value / 12.92
                : ((value + 0.055) / 1.055) ** 2.4;
        });
    const luminance =
        channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;

    return {
        backgroundColor: hex,
        color: luminance > 0.179 ? '#000000' : '#FFFFFF',
    };
}

function getColorStyle(hex: string) {
    return { backgroundColor: hex };
}

function getPalettePreviewStyle(palette: PalettePreview): CSSProperties {
    return {
        '--preview-primary': palette.colors[0]?.hex ?? '#2563EB',
        '--preview-accent': palette.colors[1]?.hex ?? '#F59E0B',
        '--preview-success': palette.colors[2]?.hex ?? '#16A34A',
        '--preview-success-text': props.dark ? '#86D9A0' : '#166534',
        '--preview-danger': palette.colors[3]?.hex ?? '#DC2626',
        '--preview-danger-text': props.dark ? '#FF9292' : '#DC2626',
        '--preview-bg': palette.colors[4]?.hex ?? '#F8FAFC',
        '--preview-surface': palette.colors[5]?.hex ?? '#FFFFFF',
        '--preview-text': palette.colors[6]?.hex ?? '#0F172A',
        '--preview-muted': palette.colors[7]?.hex ?? '#64748B',
        '--preview-highlight':
            palette.colors[9]?.hex ?? (props.dark ? '#213C35' : '#EFF6FF'),
        '--preview-on-primary':
            palette.primaryForeground ?? (props.dark ? '#001219' : '#FFFFFF'),
        '--preview-primary-hover':
            palette.primaryHover ??
            'color-mix(in srgb, var(--preview-primary) 94%, #000000)',
        '--preview-on-highlight': props.dark ? '#EDF2F4' : '#001219',
        '--preview-focus': palette.colors[8]?.hex ?? palette.colors[0]?.hex,
        '--preview-hover': props.dark ? '#252B30' : '#F1F5F9',
        '--preview-border': props.dark ? '#343C42' : '#D6DFE3',
        '--preview-input-border': props.dark ? '#78878F' : '#64748B',
    } as CSSProperties;
}
</script>

<template>
    <section class="space-y-6" aria-label="Wizualny podgląd palet kolorów">
        <div class="grid w-full gap-6">
            <UiCard
                v-for="palette in palettes"
                :key="palette.name"
                class="min-w-0 overflow-hidden rounded-lg shadow-sm"
                :style="getPalettePreviewStyle(palette)"
            >
                <div class="flex" aria-hidden="true">
                    <div
                        v-for="color in palette.colors"
                        :key="`${palette.name}-${color.name}-stripe`"
                        class="h-3 flex-1"
                        :style="getColorStyle(color.hex)"
                    />
                </div>

                <UiCardHeader class="space-y-3">
                    <div
                        class="flex flex-wrap items-start justify-between gap-3"
                    >
                        <div class="min-w-0">
                            <UiCardTitle class="text-xl font-extrabold">
                                {{ palette.name }}
                            </UiCardTitle>
                            <UiCardDescription>
                                {{ palette.shortName }}
                            </UiCardDescription>
                        </div>
                        <UiBadge
                            variant="outline"
                            class="palette-verdict rounded-full px-3 py-1"
                        >
                            {{ palette.verdict }}
                        </UiBadge>
                    </div>
                    <p class="text-muted-foreground text-sm leading-relaxed">
                        {{ palette.description }}
                    </p>
                    <a
                        v-if="palette.source"
                        :href="
                            props.dark
                                ? 'https://www.dark.design/site/fey'
                                : palette.source
                        "
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-sm underline underline-offset-4"
                        >{{
                            props.dark
                                ? 'Inspiracja: dark.design / Fey'
                                : 'Vibrant Color Fiesta na Coolors'
                        }}</a
                    >
                </UiCardHeader>

                <UiCardContent class="space-y-5">
                    <div
                        class="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-4"
                    >
                        <div
                            v-for="color in palette.colors"
                            :key="`${palette.name}-${color.name}`"
                            class="min-h-28 min-w-0 rounded-lg border border-black/10 p-3 shadow-xs"
                            :style="getSwatchStyle(color.hex)"
                        >
                            <p class="text-sm font-extrabold">
                                {{ color.name }}
                            </p>
                            <p class="font-mono text-xs font-semibold">
                                {{ color.hex }}
                            </p>
                            <p class="mt-4 text-xs leading-snug">
                                {{ color.usage }}
                            </p>
                        </div>
                    </div>

                    <div
                        class="palette-mini-preview overflow-hidden rounded-lg"
                        :style="getPalettePreviewStyle(palette)"
                    >
                        <div
                            class="preview-app-header flex items-center justify-between gap-3 px-4 py-3"
                            :style="
                                getColorStyle(
                                    palette.colors[0]?.hex ?? '#2563EB',
                                )
                            "
                        >
                            <p class="truncate text-sm font-extrabold">
                                OSK Manager
                            </p>
                            <span
                                class="size-3 shrink-0 rounded-full ring-4 ring-white/30"
                                :style="
                                    getColorStyle(
                                        palette.colors[1]?.hex ?? '#F59E0B',
                                    )
                                "
                            />
                        </div>

                        <div class="space-y-3 p-4">
                            <div
                                class="flex items-center justify-between gap-3"
                            >
                                <div>
                                    <p
                                        class="text-sm font-extrabold"
                                        :style="{
                                            color:
                                                palette.colors[6]?.hex ??
                                                '#0F172A',
                                        }"
                                    >
                                        Harmonogram jazd
                                    </p>
                                    <p
                                        class="text-xs"
                                        :style="{
                                            color:
                                                palette.colors[7]?.hex ??
                                                '#64748B',
                                        }"
                                    >
                                        Dzisiaj, 8 zaplanowanych lekcji
                                    </p>
                                </div>
                                <span
                                    class="preview-progress-label rounded-full px-3 py-1 text-xs font-bold"
                                >
                                    68%
                                </span>
                            </div>

                            <div
                                class="preview-lesson border-y py-3"
                                :style="
                                    getColorStyle(
                                        palette.colors[5]?.hex ?? '#FFFFFF',
                                    )
                                "
                            >
                                <div
                                    class="mb-3 flex items-center justify-between gap-2"
                                >
                                    <p
                                        class="truncate text-sm font-bold"
                                        :style="{
                                            color:
                                                palette.colors[6]?.hex ??
                                                '#0F172A',
                                        }"
                                    >
                                        Anna Kowalska
                                    </p>
                                    <p
                                        class="text-xs font-semibold"
                                        :style="{
                                            color:
                                                palette.colors[7]?.hex ??
                                                '#64748B',
                                        }"
                                    >
                                        kat. B
                                    </p>
                                </div>
                                <div
                                    class="preview-progress-track h-2 overflow-hidden rounded-full"
                                >
                                    <div
                                        class="h-full w-2/3 rounded-full"
                                        :style="
                                            getColorStyle(
                                                palette.colors[8]?.hex ??
                                                    palette.colors[0]?.hex ??
                                                    '#2563EB',
                                            )
                                        "
                                    />
                                </div>
                            </div>

                            <UiButton
                                type="button"
                                class="preview-button-primary h-10 w-full rounded-lg font-bold"
                            >
                                Dodaj jazdę
                            </UiButton>
                        </div>
                    </div>

                    <section
                        class="palette-components-preview"
                        :style="getPalettePreviewStyle(palette)"
                        :aria-label="`Preview komponentów dla palety ${palette.name}`"
                    >
                        <div class="preview-toolbar">
                            <div>
                                <p class="preview-heading">Szczegóły jazdy</p>
                                <p class="preview-subtitle">
                                    Anna Kowalska · kat. B
                                </p>
                            </div>
                            <span class="preview-status">Aktywne</span>
                        </div>

                        <div class="preview-button-row">
                            <button
                                class="preview-button-primary"
                                type="button"
                            >
                                Zapisz jazdę
                            </button>
                            <button
                                class="preview-button-secondary"
                                type="button"
                            >
                                Anuluj
                            </button>
                            <button class="preview-button-ghost" type="button">
                                Szczegóły
                            </button>
                            <button
                                class="preview-button-secondary"
                                type="button"
                                disabled
                            >
                                Zakończona
                            </button>
                        </div>

                        <div class="preview-form-grid">
                            <label class="preview-field">
                                <span>Imię i nazwisko kursanta</span>
                                <input
                                    value="Anna Kowalska"
                                    aria-label="Przykładowe pole tekstowe"
                                />
                            </label>

                            <label class="preview-field">
                                <span>Status lekcji</span>
                                <select
                                    value="scheduled"
                                    aria-label="Przykładowy select"
                                >
                                    <option value="scheduled">
                                        Zaplanowana
                                    </option>
                                    <option value="done">Zakończona</option>
                                </select>
                            </label>
                        </div>

                        <label class="preview-field">
                            <span>Notatka instruktora</span>
                            <textarea
                                aria-label="Przykładowe pole tekstowe wieloliniowe"
                                rows="3"
                            >
Manewry na placu zaliczone. Następna jazda: parkowanie równoległe.</textarea
                            >
                        </label>

                        <div class="preview-controls-row">
                            <label class="preview-checkbox">
                                <input type="checkbox" checked />
                                <span>Potwierdź SMS-em</span>
                            </label>

                            <label class="preview-switch">
                                <input type="checkbox" checked />
                                <span aria-hidden="true" />
                                <strong>Tryb pilny</strong>
                            </label>
                        </div>

                        <div class="preview-alerts">
                            <div class="preview-alert preview-alert-success">
                                Opłacono ratę kursu
                            </div>
                            <div class="preview-alert preview-alert-warning">
                                Jutro kończy się termin
                            </div>
                            <div class="preview-alert preview-alert-danger">
                                Jazda anulowana
                            </div>
                        </div>
                    </section>
                </UiCardContent>
            </UiCard>
        </div>
    </section>
</template>

<style scoped>
.palette-verdict {
    background: var(--preview-highlight);
    color: var(--preview-on-highlight);
    border-color: var(--preview-border);
    white-space: normal;
}

.preview-app-header {
    color: var(--preview-on-primary);
}

.preview-lesson {
    border-color: var(--preview-border);
}

.preview-progress-track {
    background: var(--preview-border);
}

.palette-components-preview {
    display: grid;
    gap: 16px;
    border-top: 1px solid
        color-mix(in srgb, var(--preview-text) 10%, transparent);
    background: var(--preview-bg);
    padding: 16px;
    color: var(--preview-text);
}

.palette-mini-preview {
    background: var(--preview-bg);
}

.preview-progress-label {
    background: var(--preview-highlight);
    color: var(--preview-on-highlight);
}

.preview-toolbar,
.preview-button-row,
.preview-controls-row,
.preview-alerts {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}

.preview-toolbar {
    justify-content: space-between;
}

.preview-heading {
    font-size: 0.875rem;
    font-weight: 800;
}

.preview-subtitle {
    color: var(--preview-muted);
    font-size: 0.75rem;
}

.preview-status {
    border-radius: 999px;
    background: color-mix(in srgb, var(--preview-success) 14%, transparent);
    color: var(--preview-success-text);
    font-size: 0.75rem;
    font-weight: 800;
    padding: 4px 10px;
}

.preview-button-primary,
.preview-button-secondary,
.preview-button-ghost {
    min-height: 40px;
    border-radius: 8px;
    padding: 8px 12px;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 800;
    transition:
        background-color 160ms ease,
        border-color 160ms ease,
        color 160ms ease,
        transform 160ms ease;
}

.preview-button-primary {
    border: 1px solid var(--preview-primary);
    background: var(--preview-primary);
    color: var(--preview-on-primary);
    cursor: pointer;
}

.preview-button-secondary {
    border: 1px solid var(--preview-muted);
    background: var(--preview-surface);
    color: var(--preview-text);
}

.preview-button-ghost {
    border: 1px solid var(--preview-border);
    background: var(--preview-surface);
    color: var(--preview-focus);
}

.preview-button-primary:hover:not(:disabled) {
    background: var(--preview-primary-hover);
    border-color: var(--preview-primary-hover);
}

.preview-button-secondary:hover:not(:disabled),
.preview-button-ghost:hover:not(:disabled) {
    background: var(--preview-hover);
}

.preview-button-secondary:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.preview-button-primary:focus-visible,
.preview-button-secondary:focus-visible,
.preview-button-ghost:focus-visible,
.preview-switch input:focus-visible + span {
    outline: 2px solid var(--preview-focus);
    outline-offset: 3px;
}

.preview-form-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.preview-field {
    display: grid;
    gap: 7px;
    min-width: 0;
}

.preview-field > span {
    color: var(--preview-text);
    font-size: 0.75rem;
    font-weight: 800;
}

.preview-field input,
.preview-field select,
.preview-field textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--preview-input-border);
    border-radius: 8px;
    background: var(--preview-surface);
    color: var(--preview-text);
    font: inherit;
    font-size: 0.875rem;
    outline: none;
    padding: 10px 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

.preview-field textarea {
    resize: none;
}

.preview-field input:focus,
.preview-field select:focus,
.preview-field textarea:focus {
    border-color: var(--preview-focus);
    box-shadow: 0 0 0 3px
        color-mix(in srgb, var(--preview-focus) 18%, transparent);
}

.preview-checkbox,
.preview-switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--preview-text);
    font-size: 0.8125rem;
    font-weight: 700;
}

.preview-checkbox input {
    accent-color: var(--preview-primary);
    inline-size: 16px;
    block-size: 16px;
}

.preview-switch input {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
}

.preview-switch span {
    position: relative;
    display: inline-flex;
    width: 36px;
    height: 20px;
    border-radius: 999px;
    flex-shrink: 0;
    background: var(--preview-muted);
    box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--preview-primary) 35%, transparent);
}

.preview-switch span::after {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: #ffffff;
    content: '';
}

.preview-switch input:checked + span {
    background: var(--preview-primary);
}

.preview-switch input:checked + span::after {
    transform: translateX(16px);
    background: var(--preview-on-primary);
}

.preview-alerts {
    align-items: stretch;
}

.preview-alert {
    flex: 1 1 140px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 800;
    padding: 10px 12px;
}

.preview-alert-success {
    background: color-mix(
        in srgb,
        var(--preview-success) 12%,
        var(--preview-surface)
    );
    color: var(--preview-success-text);
}

.preview-alert-warning {
    background: color-mix(
        in srgb,
        var(--preview-accent) 18%,
        var(--preview-surface)
    );
    border-left: 3px solid var(--preview-accent);
    color: var(--preview-text);
}

.preview-alert-danger {
    background: color-mix(
        in srgb,
        var(--preview-danger) 10%,
        var(--preview-surface)
    );
    color: var(--preview-danger-text);
}

@media (max-width: 640px) {
    .preview-form-grid {
        grid-template-columns: 1fr;
    }

    .preview-button-primary,
    .preview-button-secondary,
    .preview-button-ghost {
        flex: 1 1 100%;
    }
}
</style>
