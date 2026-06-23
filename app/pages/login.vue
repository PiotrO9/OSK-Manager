<script setup lang="ts">
import {
    ArrowLeft,
    BadgeCheck,
    Car,
    LogIn,
    ShieldCheck,
} from 'lucide-vue-next';
import { z } from 'zod';
import { isSafeRelativeRedirectPath } from '~/utils/authReturnPath';

definePageMeta({
    layout: false,
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
const { fetchDefaultDrivingSchool } = useDrivingSchoolsApi();

const DEFAULT_MANAGER_LANDING_PATHS = new Set(['/', '']);

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

        const redirectTarget = resolveRedirectTarget();
        const landing = await resolveManagerPostLoginPath(redirectTarget);

        navigateTo(landing);
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
    <div
        class="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 dark:bg-slate-950 dark:text-slate-50"
    >
        <section
            class="grid w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:min-h-[620px] lg:grid-cols-[1.18fr_0.82fr] dark:border-slate-800 dark:bg-slate-950"
            aria-label="Logowanie do OSK Manager"
        >
            <div
                class="flex min-h-[420px] flex-col justify-between bg-sky-50/70 p-6 sm:p-10 lg:p-12 dark:bg-slate-900"
            >
                <div class="space-y-10">
                    <div class="flex items-center gap-3">
                        <div
                            class="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-extrabold text-white shadow-sm dark:bg-slate-50 dark:text-slate-950"
                        >
                            OM
                        </div>
                        <div>
                            <p class="text-base leading-tight font-extrabold">
                                OSK Manager
                            </p>
                            <p
                                class="text-sm text-slate-500 dark:text-slate-400"
                            >
                                Panel
                            </p>
                        </div>
                    </div>

                    <div class="max-w-xl space-y-3">
                        <h1
                            class="text-4xl leading-[1.08] font-extrabold text-slate-950 sm:text-5xl dark:text-slate-50"
                        >
                            Zaloguj się do OSK Manager
                        </h1>
                        <p class="text-base text-slate-600 dark:text-slate-300">
                            Szybki dostęp do panelu szkoły, instruktora i
                            kursanta.
                        </p>
                    </div>
                </div>

                <div
                    class="mt-12 max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(14,165,233,0.12)] dark:border-slate-800 dark:bg-slate-950"
                >
                    <div class="flex items-start gap-4">
                        <div
                            class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300"
                        >
                            <Car class="size-5" aria-hidden="true" />
                        </div>
                        <div class="space-y-1">
                            <h2 class="text-lg font-extrabold">
                                Jedno miejsce do planowania jazd
                            </h2>
                            <p
                                class="text-sm text-slate-600 dark:text-slate-400"
                            >
                                Kalendarz, kursanci, instruktorzy i płatności w
                                spójnym panelu.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="flex items-center justify-center px-6 py-8 sm:px-10 lg:px-12"
            >
                <UiCard
                    class="w-full max-w-[420px] border-0 bg-transparent shadow-none"
                    aria-label="Panel logowania"
                >
                    <UiCardContent class="p-0">
                        <form
                            v-if="!isAuthenticated"
                            class="space-y-5"
                            @submit.prevent="handleLogin"
                        >
                            <div class="space-y-2">
                                <label
                                    class="block text-sm font-bold text-slate-900 dark:text-slate-100"
                                    for="emailInput"
                                >
                                    Email
                                </label>
                                <UiInput
                                    id="emailInput"
                                    v-model="email"
                                    class="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm shadow-none focus-visible:ring-sky-500 dark:border-slate-800 dark:bg-slate-900"
                                    type="email"
                                    placeholder="np. jan@example.com"
                                    aria-label="Email"
                                    :disabled="isLoading"
                                    @keydown="handleKeyDown"
                                />
                            </div>

                            <div class="space-y-2">
                                <label
                                    class="block text-sm font-bold text-slate-900 dark:text-slate-100"
                                    for="passwordInput"
                                >
                                    Hasło
                                </label>
                                <UiInput
                                    id="passwordInput"
                                    v-model="password"
                                    class="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm shadow-none focus-visible:ring-sky-500 dark:border-slate-800 dark:bg-slate-900"
                                    type="password"
                                    placeholder="Wprowadź hasło"
                                    aria-label="Hasło"
                                    :disabled="isLoading"
                                    @keydown="handleKeyDown"
                                />
                            </div>

                            <UiButton
                                type="submit"
                                class="h-12 w-full rounded-xl bg-sky-500 text-sm font-extrabold text-white shadow-none hover:bg-sky-600"
                                aria-label="Zaloguj się"
                                :disabled="!isFormValid || isLoading"
                            >
                                <LogIn class="mr-2 size-4" aria-hidden="true" />
                                {{ isLoading ? 'Ładowanie...' : 'Zaloguj się' }}
                            </UiButton>

                            <div
                                v-if="showDemoMockLoginUi"
                                class="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
                                role="region"
                                aria-label="Demo: szybkie uzupełnianie formularza logowania"
                            >
                                <div class="flex flex-wrap gap-2">
                                    <UiButton
                                        type="button"
                                        variant="secondary"
                                        class="h-8 rounded-full border border-sky-200 bg-sky-50 px-4 text-xs font-extrabold text-sky-700 shadow-none hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300"
                                        aria-label="Demo: wstaw dane konta szefa w formularz"
                                        :disabled="isLoading"
                                        @click="handleDemoMockFill('manager')"
                                    >
                                        Demo manager
                                    </UiButton>
                                    <UiButton
                                        type="button"
                                        variant="secondary"
                                        class="h-8 rounded-full border border-slate-200 bg-slate-50 px-4 text-xs font-extrabold text-slate-600 shadow-none hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                        aria-label="Demo: wstaw dane konta kursanta w formularz"
                                        :disabled="isLoading"
                                        @click="handleDemoMockFill('student')"
                                    >
                                        Demo kursant
                                    </UiButton>
                                    <UiButton
                                        type="button"
                                        variant="secondary"
                                        class="h-8 rounded-full border border-slate-200 bg-slate-50 px-4 text-xs font-extrabold text-slate-600 shadow-none hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                        aria-label="Demo: wstaw dane konta instruktora w formularz"
                                        :disabled="isLoading"
                                        @click="
                                            handleDemoMockFill('instructor')
                                        "
                                    >
                                        Demo instruktor
                                    </UiButton>
                                </div>
                            </div>
                        </form>

                        <div
                            v-else
                            class="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div class="flex items-start gap-4">
                                <div
                                    class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                >
                                    <BadgeCheck
                                        class="size-5"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <p class="text-sm text-slate-500">
                                        Status sesji
                                    </p>
                                    <p
                                        class="text-base font-extrabold text-slate-950 dark:text-slate-50"
                                    >
                                        Zalogowany jako:
                                        {{ session?.userName }}
                                    </p>
                                </div>
                            </div>

                            <div class="grid gap-2 sm:grid-cols-2">
                                <UiButton
                                    type="button"
                                    variant="secondary"
                                    class="h-11 rounded-xl"
                                    aria-label="Wyloguj się"
                                    @click="handleLogoutClick"
                                >
                                    Wyloguj się
                                </UiButton>
                                <UiButton
                                    type="button"
                                    class="h-11 rounded-xl bg-sky-500 text-white hover:bg-sky-600"
                                    aria-label="Przejdź do strony głównej"
                                    @click="handleGoHome"
                                >
                                    <ArrowLeft
                                        class="mr-2 size-4"
                                        aria-hidden="true"
                                    />
                                    Strona główna
                                </UiButton>
                            </div>
                        </div>

                        <div
                            class="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"
                        >
                            <ShieldCheck class="size-4" aria-hidden="true" />
                            Bezpieczne logowanie do panelu
                        </div>
                    </UiCardContent>
                </UiCard>
            </div>
        </section>
    </div>
</template>
