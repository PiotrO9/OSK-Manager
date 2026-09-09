import { describe, expect, it } from 'vitest';
import {
    DESIGN_SYSTEM_SECTION_IDS,
    DESIGN_SYSTEM_SECTIONS,
    isDesignSystemSectionId,
} from './sections';

describe('design system sections', () => {
    it('keeps navigation metadata aligned with supported section ids', () => {
        expect(DESIGN_SYSTEM_SECTIONS.map((section) => section.id)).toEqual(
            DESIGN_SYSTEM_SECTION_IDS,
        );
    });

    it('accepts only known section ids', () => {
        expect(isDesignSystemSectionId('schedule')).toBe(true);
        expect(isDesignSystemSectionId('unknown')).toBe(false);
        expect(isDesignSystemSectionId(undefined)).toBe(false);
    });
});
