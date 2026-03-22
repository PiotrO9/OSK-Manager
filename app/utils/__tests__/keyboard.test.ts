import { describe, it, expect } from 'vitest';
import { isEnterOrSpaceKey } from '../keyboard';

describe('isEnterOrSpaceKey', () => {
    it('powinien zwrócić false dla pustego eventu', () => {
        expect(isEnterOrSpaceKey(null as unknown as KeyboardEvent)).toBe(false);
        expect(isEnterOrSpaceKey(undefined as unknown as KeyboardEvent)).toBe(
            false,
        );
    });

    it('powinien zwrócić true dla klawisza Enter', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });

        expect(isEnterOrSpaceKey(event)).toBe(true);
    });

    it('powinien zwrócić true dla klawisza spacji', () => {
        const event = new KeyboardEvent('keydown', { key: ' ' });

        expect(isEnterOrSpaceKey(event)).toBe(true);
    });

    it('powinien zwrócić false dla innych klawiszy', () => {
        const eventA = new KeyboardEvent('keydown', { key: 'a' });
        const eventEscape = new KeyboardEvent('keydown', { key: 'Escape' });
        const eventTab = new KeyboardEvent('keydown', { key: 'Tab' });
        const eventArrow = new KeyboardEvent('keydown', { key: 'ArrowDown' });

        expect(isEnterOrSpaceKey(eventA)).toBe(false);
        expect(isEnterOrSpaceKey(eventEscape)).toBe(false);
        expect(isEnterOrSpaceKey(eventTab)).toBe(false);
        expect(isEnterOrSpaceKey(eventArrow)).toBe(false);
    });

    it('powinien zwrócić false dla klawisza Enter z inną wartością key', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
        });

        expect(isEnterOrSpaceKey(event)).toBe(true);
    });
});
