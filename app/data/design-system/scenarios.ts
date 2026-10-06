export const designSystemScenarioOptions = [
    { value: 'data', label: 'Dane' },
    { value: 'empty', label: 'Brak danych' },
    { value: 'no-results', label: 'Brak wyników' },
    { value: 'loading', label: 'Ładowanie' },
    { value: 'error', label: 'Błąd' },
] as const;

export type DesignSystemScenario =
    (typeof designSystemScenarioOptions)[number]['value'];
