<script setup lang="ts">
import { z } from 'zod';
import { isSafeRelativeRedirectPath } from '~/utils/authReturnPath';

definePageMeta({
    layout: 'default',
});

usePageMeta({
    title: () => 'Logowanie',
    description: () => 'Zaloguj się do aplikacji.',
});

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

/** Tymczasowe MVP/demo: tylko uzupełnia pola; bez logowania. Widoczne w dev lub gdy public.demoMockLogin. */
type DemoMockLoginRole = 'student' | 'instructor' | 'manager';

const DEMO_MOCK_LOGIN_CREDENTIALS: Record<
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

const showDemoMockLoginUi = computed(
    () => import.meta.dev || Boolean(runtimeConfig.public.demoMockLogin),
);

const redirectQuerySchema = z.string().min(1).optional();

const loginFieldsSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Podaj adres e-mail')
        .email('Nieprawidłowy format e-mail'),
    password: z.string().min(1, 'Podaj hasło'),
});

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
        useAppToast().addToast({
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
        useAppToast().addToast({
            title: 'Formularz',
            description: firstIssue?.message ?? 'Uzupełnij pola poprawnie.',
            variant: 'error',
        });

        return;
    }

    isLoading.value = true;

    try {
        await login(parsedFields.data.email, parsedFields.data.password);
        useAppToast().addToast({
            title: 'Zalogowano',
            description: `Witaj, ${session.value?.userName || emailTrimmed.value}!`,
            variant: 'success',
        });
        navigateTo(resolveRedirectTarget());
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : 'Błąd logowania';

        useAppToast().addToast({
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
</script>

<template>
    <div class="mx-auto w-full max-w-xl space-y-6">
        <div class="space-y-2">
            <h1 class="text-2xl font-extrabold tracking-tight">Logowanie</h1>
            <p class="text-slate-700 dark:text-slate-300">
                Zaloguj się używając adresu e-mail i hasła. Tokeny JWT są
                przechowywane w bezpiecznych plikach cookie HTTP-only.
            </p>
        </div>

        <Card :aria-label="`Card: Sesja`">
            <template #header>
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Sesja
                </p>
            </template>

            <div class="space-y-4">
                <p class="text-sm text-slate-600 dark:text-slate-400">
                    Status:
                    <span
                        class="font-semibold text-slate-900 dark:text-slate-50"
                    >
                        {{
                            isAuthenticated
                                ? `Zalogowany jako: ${session?.userName}`
                                : 'Wylogowany'
                        }}
                    </span>
                </p>

                <div v-if="!isAuthenticated" class="space-y-4">
                    <div class="space-y-2">
                        <label
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            for="emailInput"
                            >Email</label
                        >
                        <Input
                            id="emailInput"
                            v-model="email"
                            type="email"
                            :placeholder="'np. jan@example.com'"
                            :aria-label="'Email'"
                            :is-disabled="isLoading"
                            @keydown="handleKeyDown"
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            for="passwordInput"
                            >Hasło</label
                        >
                        <Input
                            id="passwordInput"
                            v-model="password"
                            type="password"
                            :placeholder="'Wprowadź hasło'"
                            :aria-label="'Hasło'"
                            :is-disabled="isLoading"
                            @keydown="handleKeyDown"
                        />
                    </div>

                    <div
                        v-if="showDemoMockLoginUi"
                        class="rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 dark:border-amber-800/60 dark:bg-amber-950/30"
                        role="region"
                        aria-label="Demo: szybkie uzupełnianie formularza logowania"
                    >
                        <p
                            class="mb-2 text-xs font-medium text-amber-900 dark:text-amber-100/90"
                        >
                            Demo (MVP): wypełnia e-mail i hasło — dalej użyj
                            „Zaloguj się”.
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <Action
                                variant="secondary"
                                :aria-label="'Demo: wstaw dane konta kursanta w formularz'"
                                :is-disabled="isLoading"
                                @click="handleDemoMockFill('student')"
                            >
                                Kursant
                            </Action>
                            <Action
                                variant="secondary"
                                :aria-label="'Demo: wstaw dane konta instruktora w formularz'"
                                :is-disabled="isLoading"
                                @click="handleDemoMockFill('instructor')"
                            >
                                Instruktor
                            </Action>
                            <Action
                                variant="secondary"
                                :aria-label="'Demo: wstaw dane konta szefa w formularz'"
                                :is-disabled="isLoading"
                                @click="handleDemoMockFill('manager')"
                            >
                                Szef
                            </Action>
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2">
                    <Action
                        v-if="!isAuthenticated"
                        :aria-label="'Zaloguj się'"
                        :is-loading="isLoading"
                        :is-disabled="!isFormValid || isLoading"
                        @click="handleLogin"
                    >
                        {{ isLoading ? 'Ładowanie...' : 'Zaloguj się' }}
                    </Action>
                    <Action
                        v-else
                        variant="secondary"
                        :aria-label="'Wyloguj się'"
                        @click="handleLogoutClick"
                    >
                        Wyloguj się
                    </Action>

                    <Action
                        variant="ghost"
                        :aria-label="'Przejdź do strony głównej'"
                        @click="handleGoHome"
                    >
                        Strona główna
                    </Action>
                </div>
            </div>
        </Card>
    </div>
</template>
