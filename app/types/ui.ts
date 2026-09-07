export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface HeaderMetaItem {
    label: string;
    value: string;
    tone?: StatusTone;
}

export interface SummaryStripItem {
    label: string;
    value: string | number;
    description?: string;
    tone?: StatusTone;
}
