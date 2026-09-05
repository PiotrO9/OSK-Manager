export type AppShellSidebarNavIconKey =
    | 'bookOpen'
    | 'building'
    | 'calendarCheck'
    | 'calendarClock'
    | 'calendarDays'
    | 'calendarPlus'
    | 'car'
    | 'creditCard'
    | 'graduationCap'
    | 'layoutDashboard'
    | 'messageSquareText'
    | 'user'
    | 'users';

export interface AppShellSidebarNavItem {
    readonly to: string;
    readonly label: string;
    readonly ariaLabel: string;
    readonly iconKey: AppShellSidebarNavIconKey;
    readonly tooltip: string;
}

export function buildAppShellSidebarNavItems(
    roleRaw: string | undefined,
): AppShellSidebarNavItem[] {
    const items: AppShellSidebarNavItem[] = [
        {
            to: '/',
            label: 'Pulpit',
            ariaLabel: 'Przejdź do pulpitu',
            iconKey: 'layoutDashboard',
            tooltip: 'Pulpit',
        },
        {
            to: '/account',
            label: 'Konto',
            ariaLabel: 'Przejdź do mojego konta',
            iconKey: 'user',
            tooltip: 'Konto',
        },
        {
            to: '/my-courses',
            label: 'Moje kursy',
            ariaLabel: 'Przejdź do listy moich kursów',
            iconKey: 'bookOpen',
            tooltip: 'Moje kursy',
        },
    ];

    const normalizedRole = roleRaw?.trim().toUpperCase();

    if (normalizedRole === 'STUDENT' || normalizedRole === 'INSTRUCTOR') {
        items.splice(1, 0, {
            to: '/my-lessons',
            label: 'Moje lekcje',
            ariaLabel: 'Przejdź do terminarza moich lekcji',
            iconKey: 'calendarDays',
            tooltip: 'Moje lekcje',
        });
    }

    if (normalizedRole === 'STUDENT') {
        items.splice(2, 0, {
            to: '/book-lesson',
            label: 'Rezerwuj jazdę',
            ariaLabel: 'Przejdz do rezerwacji jazdy',
            iconKey: 'calendarPlus',
            tooltip: 'Rezerwuj jazdę',
        });
        items.splice(4, 0, {
            to: '/my-payments',
            label: 'Moje opłaty',
            ariaLabel: 'Przejdź do listy moich opłat',
            iconKey: 'creditCard',
            tooltip: 'Moje opłaty',
        });
    }

    if (normalizedRole === 'INSTRUCTOR') {
        items.splice(2, 0, {
            to: '/my-reviews',
            label: 'Moje opinie',
            ariaLabel: 'Przejdz do opinii o moich lekcjach',
            iconKey: 'messageSquareText',
            tooltip: 'Moje opinie',
        });
        items.splice(3, 0, {
            to: '/events',
            label: 'Moje wydarzenia',
            ariaLabel: 'Przejdź do dziennego widoku moich wydarzeń',
            iconKey: 'calendarCheck',
            tooltip: 'Moje wydarzenia',
        });
    }

    if (roleRaw === 'MANAGER') {
        items.splice(1, 0, {
            to: '/vehicles',
            label: 'Pojazdy',
            ariaLabel: 'Przejdź do listy pojazdów',
            iconKey: 'car',
            tooltip: 'Pojazdy',
        });

        items.push({
            to: '/manager/osk',
            label: 'OSK',
            ariaLabel: 'Przejdź do zarządzania szkołami jazdy',
            iconKey: 'building',
            tooltip: 'Szkoły jazdy',
        });
    }

    if (roleRaw === 'MANAGER' || roleRaw === 'ADMIN') {
        items.push(
            {
                to: '/manager/instructors',
                label: 'Instruktorzy',
                ariaLabel: 'Przejdź do zarządzania instruktorami',
                iconKey: 'graduationCap',
                tooltip: 'Instruktorzy',
            },
            {
                to: '/manager/students',
                label: 'Kursanci',
                ariaLabel: 'Przejdź do zarządzania kursantami',
                iconKey: 'users',
                tooltip: 'Kursanci',
            },
            {
                to: '/manager/courses',
                label: 'Kursy',
                ariaLabel: 'Przejdź do listy kursów',
                iconKey: 'bookOpen',
                tooltip: 'Kursy',
            },
            {
                to: '/events',
                label: 'Wydarzenia',
                ariaLabel: 'Przejdź do dziennego widoku wydarzeń instruktorów',
                iconKey: 'calendarCheck',
                tooltip: 'Wydarzenia',
            },
            {
                to: '/manager/reviews',
                label: 'Opinie',
                ariaLabel: 'Przejdz do listy opinii o lekcjach',
                iconKey: 'messageSquareText',
                tooltip: 'Opinie',
            },
            {
                to: '/manager/schedule',
                label: 'Harmonogram',
                ariaLabel: 'Przejdź do tygodniowego harmonogramu lekcji szkoły',
                iconKey: 'calendarClock',
                tooltip: 'Harmonogram lekcji',
            },
        );
    }

    return items;
}

export function isAppShellSidebarNavActive(
    currentPath: string,
    targetPath: string,
): boolean {
    if (targetPath === '/') {
        return currentPath === '/' || currentPath === '';
    }

    return (
        currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
    );
}

export function getAppShellUserInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return 'U';
    }

    if (parts.length === 1) {
        const w = parts[0] ?? '';

        return w.slice(0, 2).toUpperCase();
    }

    const a = parts[0]?.[0] ?? '';
    const b = parts[1]?.[0] ?? '';
    const pair = `${a}${b}`.toUpperCase();

    return pair || 'U';
}
