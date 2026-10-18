import { describe, expect, it } from 'vitest';
import {
    buildAppShellSidebarNavItems,
    getAppShellUserInitials,
    isAppShellSidebarNavActive,
} from './appShellSidebarNav';

function navPaths(role?: string): string[] {
    return buildAppShellSidebarNavItems(role).map((item) => item.to);
}

describe('app shell sidebar navigation model', () => {
    it('builds base navigation for unauthenticated or unknown roles', () => {
        expect(navPaths()).toEqual(['/', '/konto']);
        expect(navPaths('ADMINISTRATOR')).toEqual(['/', '/konto']);
    });

    it('builds student navigation in the expected order', () => {
        expect(navPaths(' student ')).toEqual([
            '/',
            '/moje-lekcje',
            '/rezerwuj-jazde',
            '/konto',
            '/moje-oplaty',
            '/moje-kursy',
        ]);
    });

    it('keeps the student-only courses link out of other roles', () => {
        expect(navPaths('INSTRUCTOR')).toEqual([
            '/',
            '/moje-lekcje',
            '/moje-opinie',
            '/wydarzenia',
            '/konto',
        ]);
        expect(navPaths('MANAGER')).not.toContain('/moje-kursy');
        expect(navPaths('ADMIN')).not.toContain('/moje-kursy');
    });

    it('builds manager navigation using the exact current role contract', () => {
        expect(navPaths('MANAGER')).toEqual([
            '/',
            '/pojazdy',
            '/konto',
            '/menedzer/osrodki',
            '/menedzer/konta',
            '/menedzer/logi-bezpieczenstwa',
            '/menedzer/instruktorzy',
            '/menedzer/kursanci',
            '/menedzer/kursy',
            '/wydarzenia',
            '/menedzer/opinie',
            '/menedzer/harmonogram',
        ]);

        expect(navPaths(' manager ')).not.toContain('/pojazdy');
        expect(navPaths(' manager ')).not.toContain(
            '/menedzer/logi-bezpieczenstwa',
        );
    });

    it('builds admin management navigation without manager-only links', () => {
        expect(navPaths('ADMIN')).toEqual([
            '/',
            '/konto',
            '/menedzer/instruktorzy',
            '/menedzer/kursanci',
            '/menedzer/kursy',
            '/wydarzenia',
            '/menedzer/opinie',
            '/menedzer/harmonogram',
        ]);
        expect(navPaths('ADMIN')).not.toContain(
            '/menedzer/logi-bezpieczenstwa',
        );
    });

    it('detects active sidebar routes', () => {
        expect(isAppShellSidebarNavActive('/', '/')).toBe(true);
        expect(isAppShellSidebarNavActive('', '/')).toBe(true);
        expect(
            isAppShellSidebarNavActive(
                '/menedzer/osrodki/123',
                '/menedzer/osrodki',
            ),
        ).toBe(true);
        expect(
            isAppShellSidebarNavActive(
                '/menedzer/osrodki',
                '/menedzer/osrodki',
            ),
        ).toBe(true);
        expect(
            isAppShellSidebarNavActive(
                '/menedzer/osrodki',
                '/menedzer/kursanci',
            ),
        ).toBe(false);
    });

    it('builds user initials from display name fallback rules', () => {
        expect(getAppShellUserInitials('')).toBe('U');
        expect(getAppShellUserInitials('piotr')).toBe('PI');
        expect(getAppShellUserInitials('Piotr Nowak')).toBe('PN');
    });
});
