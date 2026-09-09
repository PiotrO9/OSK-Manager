export interface DesignSystemColorStep {
    step: string;
    value: string;
    foreground: '#ffffff' | '#001219';
    isBase?: boolean;
}

export interface DesignSystemColorFamily {
    name: string;
    token: string;
    usage: string;
    steps: readonly DesignSystemColorStep[];
}

export interface DesignSystemThemeToken {
    name: string;
    variable: string;
    light: string;
    dark: string;
}

export const DESIGN_SYSTEM_COLOR_FAMILIES: readonly DesignSystemColorFamily[] =
    [
        {
            name: 'Cobalt',
            token: 'Primary',
            usage: 'Akcje i nawigacja',
            steps: [
                { step: '950', value: '#172554', foreground: '#ffffff' },
                { step: '900', value: '#1e3a8a', foreground: '#ffffff' },
                { step: '800', value: '#1e40af', foreground: '#ffffff' },
                { step: '700', value: '#1d4ed8', foreground: '#ffffff' },
                {
                    step: '600',
                    value: '#2563eb',
                    foreground: '#ffffff',
                    isBase: true,
                },
                { step: '500', value: '#3b82f6', foreground: '#001219' },
                { step: '400', value: '#60a5fa', foreground: '#001219' },
                { step: '300', value: '#93c5fd', foreground: '#001219' },
                { step: '200', value: '#bfdbfe', foreground: '#001219' },
                { step: '100', value: '#dbeafe', foreground: '#001219' },
                { step: '50', value: '#eff6ff', foreground: '#001219' },
            ],
        },
        {
            name: 'Orange',
            token: 'Accent',
            usage: 'Uwagi i wyróżnienia',
            steps: [
                { step: '950', value: '#431407', foreground: '#ffffff' },
                { step: '900', value: '#7c2d12', foreground: '#ffffff' },
                { step: '800', value: '#9a3412', foreground: '#ffffff' },
                { step: '700', value: '#c2410c', foreground: '#ffffff' },
                { step: '600', value: '#ea580c', foreground: '#ffffff' },
                {
                    step: '500',
                    value: '#f97316',
                    foreground: '#001219',
                    isBase: true,
                },
                { step: '400', value: '#fb923c', foreground: '#001219' },
                { step: '300', value: '#fdba74', foreground: '#001219' },
                { step: '200', value: '#fed7aa', foreground: '#001219' },
                { step: '100', value: '#ffedd5', foreground: '#001219' },
                { step: '50', value: '#fff7ed', foreground: '#001219' },
            ],
        },
        {
            name: 'Green',
            token: 'Success',
            usage: 'Opłacone i ukończone',
            steps: [
                { step: '950', value: '#052e16', foreground: '#ffffff' },
                { step: '900', value: '#14532d', foreground: '#ffffff' },
                { step: '800', value: '#166534', foreground: '#ffffff' },
                { step: '700', value: '#15803d', foreground: '#ffffff' },
                {
                    step: '600',
                    value: '#16a34a',
                    foreground: '#ffffff',
                    isBase: true,
                },
                { step: '500', value: '#22c55e', foreground: '#001219' },
                { step: '400', value: '#4ade80', foreground: '#001219' },
                { step: '300', value: '#86efac', foreground: '#001219' },
                { step: '200', value: '#bbf7d0', foreground: '#001219' },
                { step: '100', value: '#dcfce7', foreground: '#001219' },
                { step: '50', value: '#f0fdf4', foreground: '#001219' },
            ],
        },
        {
            name: 'Red',
            token: 'Danger',
            usage: 'Błędy i usuwanie',
            steps: [
                { step: '950', value: '#450a0a', foreground: '#ffffff' },
                { step: '900', value: '#7f1d1d', foreground: '#ffffff' },
                { step: '800', value: '#991b1b', foreground: '#ffffff' },
                { step: '700', value: '#b91c1c', foreground: '#ffffff' },
                {
                    step: '600',
                    value: '#dc2626',
                    foreground: '#ffffff',
                    isBase: true,
                },
                { step: '500', value: '#ef4444', foreground: '#001219' },
                { step: '400', value: '#f87171', foreground: '#001219' },
                { step: '300', value: '#fca5a5', foreground: '#001219' },
                { step: '200', value: '#fecaca', foreground: '#001219' },
                { step: '100', value: '#fee2e2', foreground: '#001219' },
                { step: '50', value: '#fef2f2', foreground: '#001219' },
            ],
        },
        {
            name: 'Graphite',
            token: 'Neutral',
            usage: 'Tekst, tła i granice',
            steps: [
                { step: '950', value: '#121416', foreground: '#ffffff' },
                { step: '900', value: '#1b1f22', foreground: '#ffffff' },
                { step: '800', value: '#252b30', foreground: '#ffffff' },
                { step: '700', value: '#343c42', foreground: '#ffffff' },
                { step: '600', value: '#465159', foreground: '#ffffff' },
                {
                    step: '500',
                    value: '#64748b',
                    foreground: '#ffffff',
                    isBase: true,
                },
                { step: '400', value: '#a8b3ba', foreground: '#001219' },
                { step: '300', value: '#cbd5e1', foreground: '#001219' },
                { step: '200', value: '#d6dfe3', foreground: '#001219' },
                { step: '100', value: '#edf2f4', foreground: '#001219' },
                { step: '50', value: '#f8fafc', foreground: '#001219' },
            ],
        },
    ] as const;

export const DESIGN_SYSTEM_THEME_TOKENS: readonly DesignSystemThemeToken[] = [
    {
        name: 'Background',
        light: '#f8fafc',
        dark: '#121416',
        variable: '--background',
    },
    {
        name: 'Surface',
        light: '#ffffff',
        dark: '#1b1f22',
        variable: '--card',
    },
    {
        name: 'Text',
        light: '#001219',
        dark: '#edf2f4',
        variable: '--foreground',
    },
    {
        name: 'Muted',
        light: '#64748b',
        dark: '#a8b3ba',
        variable: '--muted-foreground',
    },
    {
        name: 'Border',
        light: '#d6dfe3',
        dark: '#343c42',
        variable: '--border',
    },
    {
        name: 'Focus',
        light: '#1d4ed8',
        dark: '#60a5fa',
        variable: '--ring',
    },
] as const;

export function findDesignSystemBaseColor(
    family: DesignSystemColorFamily,
): string {
    return (
        family.steps.find((step) => step.isBase)?.value ??
        family.steps[0]!.value
    );
}
