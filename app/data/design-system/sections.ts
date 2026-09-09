export const DESIGN_SYSTEM_SECTION_IDS = [
    'foundations',
    'actions',
    'forms',
    'data',
    'schedule',
    'feedback',
    'patterns',
] as const;

export type DesignSystemSectionId = (typeof DESIGN_SYSTEM_SECTION_IDS)[number];

export interface DesignSystemSection {
    id: DesignSystemSectionId;
    label: string;
    description: string;
}

export const DESIGN_SYSTEM_SECTIONS: readonly DesignSystemSection[] = [
    {
        id: 'foundations',
        label: 'Fundamenty',
        description: 'Kolory, typografia, odstępy i gęstość.',
    },
    {
        id: 'actions',
        label: 'Akcje',
        description: 'Przyciski, grupy akcji i ich stany.',
    },
    {
        id: 'forms',
        label: 'Formularze',
        description: 'Pola, wybory, walidacja oraz data i czas.',
    },
    {
        id: 'data',
        label: 'Dane',
        description: 'Tabele, listy, filtry i paginacja.',
    },
    {
        id: 'schedule',
        label: 'Harmonogram',
        description: 'Lekcje, dostępność i konflikty terminów.',
    },
    {
        id: 'feedback',
        label: 'Komunikaty',
        description: 'Ładowanie, pusty stan, błąd, powiadomienie i dialog.',
    },
    {
        id: 'patterns',
        label: 'Wzorce ekranów',
        description: 'Gotowe kompozycje dla codziennej pracy OSK.',
    },
] as const;

export function isDesignSystemSectionId(
    value: unknown,
): value is DesignSystemSectionId {
    return (
        typeof value === 'string' &&
        DESIGN_SYSTEM_SECTION_IDS.includes(value as DesignSystemSectionId)
    );
}
