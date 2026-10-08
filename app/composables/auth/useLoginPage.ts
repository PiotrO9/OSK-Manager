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

const emailFieldSchema = z
    .string()
    .trim()
    .min(1, 'Podaj adres e-mail')
    .email('Nieprawidłowy format e-mail');
const passwordFieldSchema = z.string().trim().min(1, 'Podaj hasło');

const loginFieldsSchema = z.object({
    email: emailFieldSchema,
    password: passwordFieldSchema,
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

    const email = shallowRef('');
    const password = shallowRef('');
    const isLoading = shallowRef(false);
    const isLoggingOut = shallowRef(false);
    const validationEnabled = shallowRef(false);
    const submitError = shallowRef<string | null>(null);

    const emailTrimmed = computed(() => email.value.trim());
    const passwordTrimmed = computed(() => password.value.trim());
    const emailError = computed(() => {
        if (!validationEnabled.value) return null;

        const result = emailFieldSchema.safeParse(emailTrimmed.value);

        return result.success
            ? null
            : (result.error.issues[0]?.message ?? null);
    });
    const passwordError = computed(() => {
        if (!validationEnabled.value) return null;

        const result = passwordFieldSchema.safeParse(passwordTrimmed.value);

        return result.success
            ? null
            : (result.error.issues[0]?.message ?? null);
    });
    const authenticatedContinueTarget = computed(() => {
        const storedTarget = returnToCookie.value;

        return storedTarget && isSafeRelativeRedirectPath(storedTarget)
            ? storedTarget
            : '/';
    });

    watch([email, password], () => {
        submitError.value = null;
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
            const redirectQueryValue = Array.isArray(redirectQuery)
                ? redirectQuery[0]
                : redirectQuery;
            const result = redirectQuerySchema.safeParse(redirectQueryValue);

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
        if (isLoading.value) {
            return;
        }

        if (isAuthenticated.value) {
            addToast({
                title: 'Już zalogowany',
                description: 'Możesz kontynuować.',
                variant: 'info',
            });
            navigateTo(resolveRedirectTarget());

            return;
        }

        validationEnabled.value = true;
        submitError.value = null;

        const parsedFields = loginFieldsSchema.safeParse({
            email: emailTrimmed.value,
            password: passwordTrimmed.value,
        });

        if (!parsedFields.success) {
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
            const landingPath =
                await resolveManagerPostLoginPath(redirectTarget);

            navigateTo(landingPath);
        } catch (err) {
            submitError.value =
                err instanceof Error ? err.message : 'Błąd logowania';
        } finally {
            isLoading.value = false;
        }
    }

    function handleContinueClick() {
        consumeReturnTo();
    }

    async function handleLogoutClick() {
        if (isLoggingOut.value) return;

        isLoggingOut.value = true;

        try {
            await handleLogout();
        } finally {
            isLoggingOut.value = false;
        }
    }

    function handleDemoMockFill(role: DemoMockLoginRole) {
        const credentials = DEMO_MOCK_LOGIN_CREDENTIALS[role];

        email.value = credentials.email;
        password.value = credentials.password;
        validationEnabled.value = false;
        submitError.value = null;
    }

    return {
        authenticatedContinueTarget,
        email,
        emailError,
        handleDemoMockFill,
        handleContinueClick,
        handleLogin,
        handleLogoutClick,
        isAuthenticated,
        isLoading,
        isLoggingOut,
        password,
        passwordError,
        session,
        showDemoMockLoginUi,
        submitError,
    };
}
