import { describe, expect, it } from 'vitest';
import {
    buildSecurityLogFilter,
    createSecurityLogFilterDraft,
    parseSecurityLogFilters,
    securityLogFilterLabel,
} from './securityLogFilters';

describe('security log filters', () => {
    it('serializes a date range using the backend contract', () => {
        const rule = buildSecurityLogFilter({
            field: 'occurredAt',
            operator: 'between',
            value: '2026-10-12',
            valueTo: '2026-10-18',
        });

        expect(rule).toMatchObject({
            field: 'occurredAt',
            operator: 'between',
            value: { from: '2026-10-12', to: '2026-10-18' },
        });
        expect(
            parseSecurityLogFilters(
                JSON.stringify({
                    rules: [rule && (({ id: _id, ...rest }) => rest)(rule)],
                }),
            ),
        ).not.toBeNull();
        expect(createSecurityLogFilterDraft(rule!)).toMatchObject({
            value: '2026-10-12',
            valueTo: '2026-10-18',
        });
    });

    it('rejects malformed combinations and duplicate rules', () => {
        expect(
            parseSecurityLogFilters(
                JSON.stringify({
                    rules: [
                        {
                            field: 'occurredAt',
                            operator: 'is',
                            value: '2026-10-18',
                        },
                    ],
                }),
            ),
        ).toBeNull();
        expect(
            parseSecurityLogFilters(
                JSON.stringify({
                    rules: [
                        {
                            field: 'occurredAt',
                            operator: 'on',
                            value: '2026-02-31',
                        },
                    ],
                }),
            ),
        ).toBeNull();
        expect(
            parseSecurityLogFilters(
                JSON.stringify({
                    rules: [
                        {
                            field: 'clientIp',
                            operator: 'isEmpty',
                            value: '1.2.3.4',
                        },
                    ],
                }),
            ),
        ).toBeNull();
        const rule = { field: 'severity', operator: 'is', value: 'HIGH' };

        expect(
            parseSecurityLogFilters(JSON.stringify({ rules: [rule, rule] })),
        ).toBeNull();
        expect(
            parseSecurityLogFilters(
                JSON.stringify({
                    rules: [
                        {
                            field: 'severity',
                            operator: 'oneOf',
                            value: ['HIGH', 'HIGH'],
                        },
                    ],
                }),
            ),
        ).toBeNull();
    });

    it('enforces count and byte limits before forwarding to the backend', () => {
        const rules = Array.from({ length: 11 }, (_, index) => ({
            field: 'httpStatus',
            operator: 'is',
            value: String(index),
        }));

        expect(parseSecurityLogFilters(JSON.stringify({ rules }))).toBeNull();
        expect(
            parseSecurityLogFilters(
                `{"rules":[],"padding":"${'a'.repeat(4100)}"}`,
            ),
        ).toBeNull();
    });

    it('shows Polish names for selected event types', () => {
        expect(
            securityLogFilterLabel({
                field: 'type',
                operator: 'oneOf',
                value: ['LOGIN_FAILED', 'ACCESS_DENIED'],
            }),
        ).toContain('Nieudane logowanie, Odmowa dostępu');
    });
});
