import { describe, expect, it, vi } from 'vitest';
import {
    buildInstructorAdvancedFilterFromDraft,
    formatInstructorAdvancedFilterSegments,
    getInstructorAdvancedFilterDraftForConditionChange,
    getInstructorAdvancedFilterDraftForFieldChange,
    isDuplicateInstructorAdvancedFilter,
} from './instructorAdvancedFilters';

describe('instructorAdvancedFilters', () => {
    it('builds text and empty filters from drafts', () => {
        vi.spyOn(crypto, 'randomUUID').mockReturnValue(
            '00000000-0000-4000-8000-000000000001',
        );

        expect(
            buildInstructorAdvancedFilterFromDraft({
                field: 'email',
                condition: 'contains',
                value: 'demo@osk.local',
            }),
        ).toEqual({
            id: '00000000-0000-4000-8000-000000000001',
            field: 'email',
            operator: 'contains',
            value: 'demo@osk.local',
        });

        expect(
            buildInstructorAdvancedFilterFromDraft({
                field: 'phone',
                condition: 'is_empty',
            }),
        ).toEqual({
            id: '00000000-0000-4000-8000-000000000001',
            field: 'phone',
            operator: 'is_empty',
        });
    });

    it('builds qualification and presence filters from drafts', () => {
        vi.spyOn(crypto, 'randomUUID').mockReturnValue(
            '00000000-0000-4000-8000-000000000002',
        );

        expect(
            buildInstructorAdvancedFilterFromDraft({
                field: 'qualification',
                condition: 'eq',
                value: 'ct-b',
            }),
        ).toEqual({
            id: '00000000-0000-4000-8000-000000000002',
            field: 'qualification',
            operator: 'eq',
            value: 'ct-b',
        });

        expect(
            buildInstructorAdvancedFilterFromDraft({
                field: 'hasQualifications',
                condition: 'not_has',
            }),
        ).toEqual({
            id: '00000000-0000-4000-8000-000000000002',
            field: 'hasQualifications',
            operator: 'eq',
            value: false,
        });
    });

    it('preserves edit id when field and condition change', () => {
        const fieldDraft = getInstructorAdvancedFilterDraftForFieldChange(
            {
                id: 'filter-1',
                field: 'email',
                condition: 'contains',
                value: 'demo',
            },
            'phone',
        );

        expect(fieldDraft).toEqual({
            id: 'filter-1',
            field: 'phone',
            condition: 'contains',
            value: undefined,
        });

        expect(
            getInstructorAdvancedFilterDraftForConditionChange(
                {
                    id: 'filter-1',
                    field: 'phone',
                    condition: 'contains',
                    value: '500',
                },
                'is_empty',
            ),
        ).toEqual({
            id: 'filter-1',
            field: 'phone',
            condition: 'is_empty',
            value: undefined,
        });
    });

    it('detects duplicates without comparing ids', () => {
        expect(
            isDuplicateInstructorAdvancedFilter(
                [
                    {
                        id: 'filter-1',
                        field: 'email',
                        operator: 'contains',
                        value: 'demo',
                    },
                ],
                {
                    id: 'filter-2',
                    field: 'email',
                    operator: 'contains',
                    value: 'demo',
                },
            ),
        ).toBe(true);
    });

    it('formats qualification labels with option names', () => {
        expect(
            formatInstructorAdvancedFilterSegments(
                {
                    field: 'qualification',
                    operator: 'eq',
                    value: 'ct-b',
                },
                [{ id: 'ct-b', code: 'B', name: 'Prawo jazdy B' }],
            ),
        ).toEqual([
            { label: 'Kwalifikacja', tone: 'field' },
            { label: 'jest', tone: 'operator' },
            { label: 'B - Prawo jazdy B', tone: 'value' },
        ]);
    });
});
