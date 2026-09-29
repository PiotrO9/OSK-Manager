import { describe, expect, it } from 'vitest';
import {
    formatAccountProfileField,
    getAccountRolePresentation,
    getAccountUserInitials,
    hasAccountPkkNumber,
} from './accountProfilePresentation';

describe('accountProfilePresentation', () => {
    it('maps known and unknown roles to semantic presentations', () => {
        expect(getAccountRolePresentation(' manager ')).toEqual({
            label: 'Manager',
            tone: 'info',
        });
        expect(getAccountRolePresentation('custom')).toEqual({
            label: 'custom',
            tone: 'neutral',
        });
        expect(getAccountRolePresentation(undefined)).toEqual({
            label: 'Nieznana rola',
            tone: 'neutral',
        });
    });

    it('formats empty profile values consistently', () => {
        expect(formatAccountProfileField('  opis  ')).toBe('opis');
        expect(formatAccountProfileField('   ')).toBe('—');
        expect(formatAccountProfileField(null)).toBe('—');
    });

    it('builds initials from the first and last name part', () => {
        expect(getAccountUserInitials('Anna Maria Kowalska')).toBe('AK');
        expect(getAccountUserInitials('Jan')).toBe('JA');
        expect(getAccountUserInitials('')).toBe('U');
    });

    it('recognizes non-empty PKK values', () => {
        expect(hasAccountPkkNumber(' 123 ')).toBe(true);
        expect(hasAccountPkkNumber(' ')).toBe(false);
        expect(hasAccountPkkNumber(null)).toBe(false);
    });
});
