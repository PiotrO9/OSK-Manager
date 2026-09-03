import { z } from 'zod';
import { isSafeRelativeRedirectPath } from '~/utils/auth/authReturnPath';

const DEFAULT_MANAGER_LANDING_PATHS = new Set(['/', '']);

/** Tymczasowe MVP/demo: tylko uzupełnia pola; bez logowania. Widoczne w dev lub gdy public.demoMockLogin. */
export type DemoMockLoginRole = 'student' | 'instructor' | 'manager';

export const DEMO_MOCK_LOGIN_CREDENTIALS: Record<
    DemoMockLoginRole,
    { email: string; password: string }
> = {
    student: { email: 'student001@post.pl', password: 'student001' },
    instructor: {
        email: 'instructor001@post.pl',
        password: 'instructor001',
    },
    manager: { email: 'manager001@post.pl', password: 'manager001' },
};

const redirectQuerySchema = z.string().min(1).optional();

const loginFieldsSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Podaj adres e-mail')
        .email('Nieprawidłowy format e-mail'),
    password: z.string().min(1, 'Podaj hasło'),
});

export function useLoginPage() {
    const route = useRoute();
    const router = useRouter();
    const {
        consumeReturnTo,
        setReturnTo,
        cookie: returnToCookie,
    } = useAuthReturnTo();
    const runtimeConfig = useRuntimeConfig();
    const { isAuthenticated, session, login } = useAuthSession();
    const { handleLogout } = useLogout();
    const { fetchDefaultDrivingSchool } = useDrivingSchoolsApi();
    const { addToast } = useAppToast();

    const showDemoMockLoginUi = computed(
        () => import.meta.dev || Boolean(runtimeConfig.public.demoMockLogin),
    );

    const email = ref('');
    const password = ref('');
    const isLoading = ref(false);

    const emailTrimmed = computed(() => email.value.trim());
    const passwordTrimmed = computed(() => password.value.trim());
    const isFormValid = computed(() => {
        const parsed = loginFieldsSchema.safeParse({
            email: emailTrimmed.value,
            password: passwordTrimmed.value,
        });

        return parsed.success;
    });

    function resolveRedirectTarget(): string {
        const defaultPath = '/';
        const fromCookie = consumeReturnTo();

        if (fromCookie) return fromCookie;

        const redirectQuery = route.query.redirect;

        if (!redirectQuery) return defaultPath;

        if (Array.isArray(redirectQuery)) {
            const firstQuery = redirectQuery[0];
            const result = redirectQuerySchema.safeParse(firstQuery);

            if (
                result.success &&
                result.data &&
                isSafeRelativeRedirectPath(result.data)
            ) {
                return result.data;
            }

            return defaultPath;
        }

        const result = redirectQuerySchema.safeParse(redirectQuery);

        if (
            result.success &&
            result.data &&
            isSafeRelativeRedirectPath(result.data)
        ) {
            return result.data;
        }

        return defaultPath;
    }

    async function resolveManagerPostLoginPath(
        redirectTarget: string,
    ): Promise<string> {
        if (session.value?.role !== 'MANAGER') {
            return redirectTarget;
        }

        if (!DEFAULT_MANAGER_LANDING_PATHS.has(redirectTarget)) {
            return redirectTarget;
        }

        const result = await fetchDefaultDrivingSchool();

        if (result.outcome === 'ok') {
            return '/';
        }

        return '/manager/osk';
    }

    /**
     * Stare linki z ?redirect= — przeniesienie do cookie i czysty URL /login.
     */
    onMounted(() => {
        const redirectQuery = route.query.redirect;

        if (redirectQuery === undefined) return;

        if (!returnToCookie.value) {
            const raw = Array.isArray(redirectQuery)
                ? redirectQuery[0]
                : redirectQuery;
            const result = redirectQuerySchema.safeParse(raw);

            if (
                result.success &&
                result.data &&
                isSafeRelativeRedirectPath(result.data)
            ) {
                setReturnTo(result.data);
            }
        }

        router.replace({ path: '/login' });
    });

    async function handleLogin() {
        if (isAuthenticated.value) {
            addToast({
                title: 'Już zalogowany',
                description: 'Możesz kontynuować.',
                variant: 'info',
            });
            navigateTo(resolveRedirectTarget());

            return;
        }

        const parsedFields = loginFieldsSchema.safeParse({
            email: emailTrimmed.value,
            password: passwordTrimmed.value,
        });

        if (!parsedFields.success) {
            const firstIssue = parsedFields.error.issues[0];

            addToast({
                title: 'Formularz',
                description: firstIssue?.message ?? 'Uzupełnij pola poprawnie.',
                variant: 'error',
            });

            return;
        }

        isLoading.value = true;

        try {
            await login(parsedFields.data.email, parsedFields.data.password);
            addToast({
                title: 'Zalogowano',
                description: `Witaj, ${session.value?.userName || emailTrimmed.value}!`,
                variant: 'success',
            });

            const redirectTarget = resolveRedirectTarget();
            const landing = await resolveManagerPostLoginPath(redirectTarget);

            navigateTo(landing);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Błąd logowania';

            addToast({
                title: 'Błąd logowania',
                description: errorMessage,
                variant: 'error',
            });
        } finally {
            isLoading.value = false;
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (isEnterOrSpaceKey(event)) {
            handleLogin();
        }
    }

    function handleGoHome() {
        navigateTo('/');
    }

    function handleLogoutClick() {
        handleLogout();
    }

    function handleDemoMockFill(role: DemoMockLoginRole) {
        const creds = DEMO_MOCK_LOGIN_CREDENTIALS[role];

        email.value = creds.email;
        password.value = creds.password;
    }

    return {
        email,
        handleDemoMockFill,
        handleGoHome,
        handleKeyDown,
        handleLogin,
        handleLogoutClick,
        isAuthenticated,
        isFormValid,
        isLoading,
        password,
        session,
        showDemoMockLoginUi,
    };
}
