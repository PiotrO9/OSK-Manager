import { appPaths } from '~~/shared/routing/appPaths';
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
    | 'shieldAlert'
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
            to: appPaths.account(),
            label: 'Konto',
            ariaLabel: 'Przejdź do mojego konta',
            iconKey: 'user',
            tooltip: 'Konto',
        },
    ];

    const normalizedRole = roleRaw?.trim().toUpperCase();

    if (normalizedRole === 'STUDENT' || normalizedRole === 'INSTRUCTOR') {
        items.splice(1, 0, {
            to: appPaths.myLessons(),
            label: 'Moje lekcje',
            ariaLabel: 'Przejdź do terminarza moich lekcji',
            iconKey: 'calendarDays',
            tooltip: 'Moje lekcje',
        });
    }

    if (normalizedRole === 'STUDENT') {
        items.splice(2, 0, {
            to: appPaths.bookLesson(),
            label: 'Rezerwuj jazdę',
            ariaLabel: 'Przejdź do rezerwacji jazdy',
            iconKey: 'calendarPlus',
            tooltip: 'Rezerwuj jazdę',
        });
        items.splice(4, 0, {
            to: appPaths.myPayments(),
            label: 'Moje opłaty',
            ariaLabel: 'Przejdź do listy moich opłat',
            iconKey: 'creditCard',
            tooltip: 'Moje opłaty',
        });
        items.push({
            to: appPaths.myCourses(),
            label: 'Moje kursy',
            ariaLabel: 'Przejdź do listy moich kursów',
            iconKey: 'bookOpen',
            tooltip: 'Moje kursy',
        });
    }

    if (normalizedRole === 'INSTRUCTOR') {
        items.splice(2, 0, {
            to: appPaths.myReviews(),
            label: 'Moje opinie',
            ariaLabel: 'Przejdz do opinii o moich lekcjach',
            iconKey: 'messageSquareText',
            tooltip: 'Moje opinie',
        });
        items.splice(3, 0, {
            to: appPaths.events(),
            label: 'Moje wydarzenia',
            ariaLabel: 'Przejdź do dziennego widoku moich wydarzeń',
            iconKey: 'calendarCheck',
            tooltip: 'Moje wydarzenia',
        });
    }

    if (roleRaw === 'MANAGER') {
        items.splice(1, 0, {
            to: appPaths.vehicles(),
            label: 'Pojazdy',
            ariaLabel: 'Przejdź do listy pojazdów',
            iconKey: 'car',
            tooltip: 'Pojazdy',
        });

        items.push({
            to: appPaths.managerSchools(),
            label: 'OSK',
            ariaLabel: 'Przejdź do zarządzania szkołami jazdy',
            iconKey: 'building',
            tooltip: 'Szkoły jazdy',
        });
        items.push({
            to: appPaths.managerAccounts(),
            label: 'Konta osób',
            ariaLabel: 'Przejdź do zarządzania kontami osób w OSK',
            iconKey: 'users',
            tooltip: 'Konta osób',
        });
        items.push({
            to: appPaths.managerSecurityLogs(),
            label: 'Logi bezpieczeństwa',
            ariaLabel: 'Przejdź do logów bezpieczeństwa',
            iconKey: 'shieldAlert',
            tooltip: 'Logi bezpieczeństwa',
        });
    }

    if (roleRaw === 'MANAGER' || roleRaw === 'ADMIN') {
        items.push(
            {
                to: appPaths.managerInstructors(),
                label: 'Instruktorzy',
                ariaLabel: 'Przejdź do zarządzania instruktorami',
                iconKey: 'graduationCap',
                tooltip: 'Instruktorzy',
            },
            {
                to: appPaths.managerStudents(),
                label: 'Kursanci',
                ariaLabel: 'Przejdź do zarządzania kursantami',
                iconKey: 'users',
                tooltip: 'Kursanci',
            },
            {
                to: appPaths.managerCourses(),
                label: 'Kursy',
                ariaLabel: 'Przejdź do listy kursów',
                iconKey: 'bookOpen',
                tooltip: 'Kursy',
            },
            {
                to: appPaths.events(),
                label: 'Wydarzenia',
                ariaLabel: 'Przejdź do dziennego widoku wydarzeń instruktorów',
                iconKey: 'calendarCheck',
                tooltip: 'Wydarzenia',
            },
            {
                to: appPaths.managerReviews(),
                label: 'Opinie',
                ariaLabel: 'Przejdz do listy opinii o lekcjach',
                iconKey: 'messageSquareText',
                tooltip: 'Opinie',
            },
            {
                to: appPaths.managerSchedule(),
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
