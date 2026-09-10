export type AdvancedFilterSegmentTone = 'field' | 'operator' | 'value';

export interface AdvancedFilterSegment {
    label: string;
    tone: AdvancedFilterSegmentTone;
}

export interface AdvancedFilterChip {
    id: string;
    label: string;
    segments: readonly AdvancedFilterSegment[];
}
