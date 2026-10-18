import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { routeDefinitions } from './routeDefinitions';
import {
    buildRoutePath,
    canonicalizeAppUrl,
    matchAppRoute,
} from './routePaths';
import { isPublicAuthPath } from '../utils/publicAuthPath';

describe('page URL contracts', () => {
    it('covers every source page once and has no duplicate destinations', () => {
        const pages = readdirSync(
            fileURLToPath(new URL('../../app/pages', import.meta.url)),
            { recursive: true },
        )
            .map(String)
            .map((file) => file.replaceAll('\\', '/'))
            .filter((file) => file.endsWith('.vue'));

        expect(routeDefinitions.map((route) => route.file).sort()).toEqual(
            pages.sort(),
        );

        for (const field of ['key', 'en', 'pl'] as const) {
            expect(
                new Set(routeDefinitions.map((route) => route[field])).size,
            ).toBe(pages.length);
        }
    });

    it.each(routeDefinitions)(
        'maps $key both ways without changing IDs or URL state',
        (definition) => {
            const params = {
                id: 'record/with space',
                userId: 'user/with space',
            };
            const en = buildRoutePath(definition.key, params, 'en');
            const pl = buildRoutePath(definition.key, params, 'pl');
            const suffix = '?schoolId=a&tag=one&tag=two&from=events#details';

            expect(matchAppRoute(en)?.definition.key).toBe(definition.key);
            expect(matchAppRoute(pl)?.definition.key).toBe(definition.key);
            expect(canonicalizeAppUrl(en + suffix, 'pl')).toBe(pl + suffix);
            expect(canonicalizeAppUrl(pl + suffix, 'pl')).toBe(pl + suffix);
            expect(canonicalizeAppUrl(pl + suffix, 'en')).toBe(en + suffix);
        },
    );

    it('resolves create pages ahead of dynamic record IDs', () => {
        expect(matchAppRoute('/vehicles/new')?.definition.key).toBe(
            'vehicleNew',
        );
        expect(matchAppRoute('/pojazdy/dodaj')?.definition.key).toBe(
            'vehicleNew',
        );
        expect(canonicalizeAppUrl('/MANAGER/COURSES/new/')).toBe(
            '/menedzer/kursy/dodaj',
        );
    });

    it.each([
        '/api/vehicles',
        '/manager/unknown',
        '//example.com/login',
        'https://example.com/login',
        '/\\example.com/login',
    ])('leaves unrelated paths unchanged: %s', (url) => {
        expect(canonicalizeAppUrl(url)).toBe(url);
    });

    it('requires parameters and rejects dot segments in generated URLs', () => {
        expect(() => buildRoutePath('vehicle')).toThrow();
        expect(() => buildRoutePath('vehicle', { id: '..' })).toThrow();
        expect(buildRoutePath('vehicle', { id: 'a%20b' })).toBe(
            '/pojazdy/a%2520b',
        );
    });

    it.each([
        '/login',
        '/logowanie/',
        '/forgot-password',
        '/przypomnij-haslo',
        '/reset-password',
        '/ustaw-haslo',
    ])('recognizes both auth variants: %s', (path) => {
        expect(isPublicAuthPath(path)).toBe(true);
    });

    it.each(['/api/auth/login', '/menedzer/konta', '/login/unknown'])(
        'does not classify protected or unknown paths as auth: %s',
        (path) => {
            expect(isPublicAuthPath(path)).toBe(false);
        },
    );
});
