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
        expect(navPaths()).toEqual(['/', '/account']);
        expect(navPaths('ADMINISTRATOR')).toEqual(['/', '/account']);
    });

    it('builds student navigation in the expected order', () => {
        expect(navPaths(' student ')).toEqual([
            '/',
            '/my-lessons',
            '/book-lesson',
            '/account',
            '/my-payments',
            '/my-courses',
        ]);
    });

    it('keeps the student-only courses link out of other roles', () => {
        expect(navPaths('INSTRUCTOR')).toEqual([
            '/',
            '/my-lessons',
            '/my-reviews',
            '/events',
            '/account',
        ]);
        expect(navPaths('MANAGER')).not.toContain('/my-courses');
        expect(navPaths('ADMIN')).not.toContain('/my-courses');
    });

    it('builds manager navigation using the exact current role contract', () => {
        expect(navPaths('MANAGER')).toEqual([
            '/',
            '/vehicles',
            '/account',
            '/manager/osk',
            '/manager/instructors',
            '/manager/students',
            '/manager/courses',
            '/events',
            '/manager/reviews',
            '/manager/schedule',
        ]);

        expect(navPaths(' manager ')).not.toContain('/vehicles');
    });

    it('builds admin management navigation without manager-only links', () => {
        expect(navPaths('ADMIN')).toEqual([
            '/',
            '/account',
            '/manager/instructors',
            '/manager/students',
            '/manager/courses',
            '/events',
            '/manager/reviews',
            '/manager/schedule',
        ]);
    });

    it('detects active sidebar routes', () => {
        expect(isAppShellSidebarNavActive('/', '/')).toBe(true);
        expect(isAppShellSidebarNavActive('', '/')).toBe(true);
        expect(
            isAppShellSidebarNavActive('/manager/osk/123', '/manager/osk'),
        ).toBe(true);
        expect(isAppShellSidebarNavActive('/manager/osk', '/manager/osk')).toBe(
            true,
        );
        expect(
            isAppShellSidebarNavActive('/manager/osk', '/manager/students'),
        ).toBe(false);
    });

    it('builds user initials from display name fallback rules', () => {
        expect(getAppShellUserInitials('')).toBe('U');
        expect(getAppShellUserInitials('piotr')).toBe('PI');
        expect(getAppShellUserInitials('Piotr Nowak')).toBe('PN');
    });
});
