export interface DesignSystemColorStep {
    step: string;
    variable: string;
    foreground: string;
    isBase: boolean;
}
export interface DesignSystemColorFamily {
    name: string;
    token: string;
    usage: string;
    steps: readonly DesignSystemColorStep[];
}
const families = [
    {
        name: 'Cobalt',
        token: 'Primary',
        usage: 'Akcje i nawigacja',
        scale: 'primary',
        base: 600,
    },
    {
        name: 'Orange',
        token: 'Warning',
        usage: 'Ostrzeżenia i uwagi',
        scale: 'warning',
        base: 500,
    },
    {
        name: 'Green',
        token: 'Success',
        usage: 'Opłacone i ukończone',
        scale: 'success',
        base: 600,
    },
    {
        name: 'Red',
        token: 'Danger',
        usage: 'Błędy i usuwanie',
        scale: 'danger',
        base: 600,
    },
    {
        name: 'Graphite',
        token: 'Neutral',
        usage: 'Tekst, tła i granice',
        scale: 'secondary',
        base: 500,
    },
] as const;

export const DESIGN_SYSTEM_COLOR_FAMILIES: readonly DesignSystemColorFamily[] =
    families.map((family) => ({
        ...family,
        steps: [950, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50].map(
            (step) => ({
                step: String(step),
                variable: `--color-${family.scale}-${step}`,
                foreground:
                    step >= 700 ||
                    (step === 600 &&
                        family.scale !== 'success' &&
                        family.scale !== 'warning') ||
                    (family.scale === 'secondary' && step === 500)
                        ? '--palette-light-text'
                        : '--palette-dark-text',
                isBase: step === family.base,
            }),
        ),
    }));

export const DESIGN_SYSTEM_THEME_TOKENS = [
    { name: 'Tło', variable: '--background' },
    { name: 'Powierzchnia', variable: '--card' },
    { name: 'Tekst powierzchni', variable: '--card-foreground' },
    { name: 'Tekst', variable: '--foreground' },
    { name: 'Tekst pomocniczy', variable: '--muted-foreground' },
    { name: 'Tło pomocnicze', variable: '--muted' },
    { name: 'Obramowanie', variable: '--border' },
    { name: 'Pole', variable: '--input' },
    { name: 'Fokus', variable: '--ring' },
    { name: 'Popover', variable: '--popover' },
    { name: 'Tekst popovera', variable: '--popover-foreground' },
    { name: 'Zaznaczenie / hover', variable: '--accent' },
    { name: 'Tekst zaznaczenia', variable: '--accent-foreground' },
    { name: 'Akcja główna', variable: '--primary' },
    { name: 'Tekst akcji', variable: '--primary-foreground' },
    { name: 'Usuwanie', variable: '--destructive' },
    { name: 'Tekst usuwania', variable: '--destructive-foreground' },
    { name: 'Sukces — tło', variable: '--status-success-background' },
    { name: 'Sukces — tekst', variable: '--status-success-foreground' },
    { name: 'Uwaga — tło', variable: '--status-warning-background' },
    { name: 'Uwaga — tekst', variable: '--status-warning-foreground' },
    { name: 'Błąd — tło', variable: '--status-danger-background' },
    { name: 'Błąd — tekst', variable: '--status-danger-foreground' },
    { name: 'Informacja — tło', variable: '--status-info-background' },
    { name: 'Informacja — tekst', variable: '--status-info-foreground' },
] as const;

export function findDesignSystemBaseColor(family: {
    steps: readonly { value: string; isBase: boolean }[];
}): string {
    return (
        family.steps.find((step) => step.isBase)?.value ??
        family.steps[0]?.value ??
        ''
    );
}
