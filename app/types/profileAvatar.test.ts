import { describe, expect, it } from 'vitest';
import { normalizeAvatarUrl, readAvatarUrlFromRecord } from './profileAvatar';

describe('profile avatar helpers', () => {
    it('normalizes missing, blank and usable avatar urls', () => {
        expect(normalizeAvatarUrl(null)).toBeNull();
        expect(normalizeAvatarUrl('  ')).toBeNull();
        expect(normalizeAvatarUrl(' https://cdn.example/avatar.jpg ')).toBe(
            'https://cdn.example/avatar.jpg',
        );
    });

    it('prefers explicit camelCase values over snake_case aliases', () => {
        expect(
            readAvatarUrlFromRecord({
                avatarUrl: null,
                avatar_url: 'https://cdn.example/avatar.jpg',
            }),
        ).toBeNull();
        expect(
            readAvatarUrlFromRecord({
                avatar_url: ' https://cdn.example/avatar.jpg ',
            }),
        ).toBe('https://cdn.example/avatar.jpg');
    });
});
