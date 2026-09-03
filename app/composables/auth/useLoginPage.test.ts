import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import type { AuthSession } from '~/utils/auth/authSessionMapper';

const addToast = vi.fn();
const consumeReturnTo = vi.fn();
const fetchDefaultDrivingSchool = vi.fn();
const handleLogout = vi.fn();
const login = vi.fn();
const navigateTo = vi.fn();
const replace = vi.fn();
const setReturnTo = vi.fn();

const route = {
    query: {} as Record<string, string | string[] | undefined>,
};
const returnToCookie = ref<string | null>(null);
const session = ref<AuthSession | null>(null);
const isAuthenticated = ref(false);
const runtimeConfig = {
    public: {
        demoMockLogin: false,
    },
};

function installGlobals(): void {
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('onMounted', (callback: () => void) => callback());
    vi.stubGlobal('useRoute', () => route);
    vi.stubGlobal('useRouter', () => ({ replace }));
    vi.stubGlobal('useAuthReturnTo', () => ({
        consumeReturnTo,
        setReturnTo,
        cookie: returnToCookie,
    }));
    vi.stubGlobal('useRuntimeConfig', () => runtimeConfig);
    vi.stubGlobal('useAuthSession', () => ({
        isAuthenticated,
        session,
        login,
    }));
    vi.stubGlobal('useLogout', () => ({ handleLogout }));
    vi.stubGlobal('useDrivingSchoolsApi', () => ({
        fetchDefaultDrivingSchool,
    }));
    vi.stubGlobal('useAppToast', () => ({ addToast }));
    vi.stubGlobal('navigateTo', navigateTo);
    vi.stubGlobal(
        'isEnterOrSpaceKey',
        (event: KeyboardEvent) => event.key === 'Enter' || event.key === ' ',
    );
}

function resetState(): void {
    route.query = {};
    returnToCookie.value = null;
    session.value = null;
    isAuthenticated.value = false;
    runtimeConfig.public.demoMockLogin = false;
}

function managerSession(): AuthSession {
    return {
        userId: 'manager-1',
        userName: 'Manager Testowy',
        email: 'manager@example.com',
        role: 'MANAGER',
        firstName: 'Manager',
        lastName: 'Testowy',
        phone: null,
        bio: null,
        drivingSchools: [],
        defaultOskId: null,
    };
}

describe('useLoginPage', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.resetAllMocks();
        resetState();
        consumeReturnTo.mockReturnValue(null);
        fetchDefaultDrivingSchool.mockResolvedValue({ outcome: 'ok' });
        navigateTo.mockResolvedValue(undefined);
        replace.mockResolvedValue(undefined);
        installGlobals();
    });

    it('fills demo credentials without submitting login', async () => {
        const { useLoginPage } = await import('./useLoginPage');
        const page = useLoginPage();

        page.handleDemoMockFill('manager');

        expect(page.email.value).toBe('manager001@post.pl');
        expect(page.password.value).toBe('manager001');
        expect(login).not.toHaveBeenCalled();
    });

    it('validates form fields before login', async () => {
        const { useLoginPage } = await import('./useLoginPage');
        const page = useLoginPage();

        page.email.value = 'bad-email';
        page.password.value = '';

        await page.handleLogin();

        expect(login).not.toHaveBeenCalled();
        expect(addToast).toHaveBeenCalledWith({
            title: 'Formularz',
            description: 'Nieprawidłowy format e-mail',
            variant: 'error',
        });
    });

    it('moves safe redirect query to return cookie and cleans login URL', async () => {
        route.query = { redirect: '/manager/lessons?day=2026-08-16' };

        const { useLoginPage } = await import('./useLoginPage');

        useLoginPage();

        expect(setReturnTo).toHaveBeenCalledWith(
            '/manager/lessons?day=2026-08-16',
        );
        expect(replace).toHaveBeenCalledWith({ path: '/login' });
    });

    it('logs in and navigates manager without default school to manager OSK page', async () => {
        fetchDefaultDrivingSchool.mockResolvedValue({ outcome: 'not_found' });
        login.mockImplementation(async () => {
            session.value = managerSession();
        });

        const { useLoginPage } = await import('./useLoginPage');
        const page = useLoginPage();

        page.email.value = 'manager@example.com';
        page.password.value = 'secret';

        await page.handleLogin();

        expect(login).toHaveBeenCalledWith('manager@example.com', 'secret');
        expect(fetchDefaultDrivingSchool).toHaveBeenCalledOnce();
        expect(navigateTo).toHaveBeenCalledWith('/manager/osk');
    });

    it('navigates authenticated users to consumed return target', async () => {
        isAuthenticated.value = true;
        consumeReturnTo.mockReturnValue('/manager/students');

        const { useLoginPage } = await import('./useLoginPage');
        const page = useLoginPage();

        await page.handleLogin();

        expect(addToast).toHaveBeenCalledWith({
            title: 'Już zalogowany',
            description: 'Możesz kontynuować.',
            variant: 'info',
        });
        expect(navigateTo).toHaveBeenCalledWith('/manager/students');
    });

    it('delegates logout from the logged-in state', async () => {
        const { useLoginPage } = await import('./useLoginPage');
        const page = useLoginPage();

        page.handleLogoutClick();

        expect(handleLogout).toHaveBeenCalledOnce();
    });
});
