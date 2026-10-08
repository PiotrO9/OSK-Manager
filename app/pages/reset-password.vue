<script setup lang="ts">
definePageMeta({ layout: false });
usePageMeta({
    title: () => 'Nowe hasło',
    description: () => 'Ustaw nowe hasło do konta.',
});

const accessToken = shallowRef('');
const refreshToken = shallowRef('');
const password = shallowRef('');
const passwordRepeat = shallowRef('');
const saving = shallowRef(false);
const changed = shallowRef(false);
const errorMessage = shallowRef('');

onMounted(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));

    if (params.get('type') === 'recovery') {
        accessToken.value = params.get('access_token') ?? '';
        refreshToken.value = params.get('refresh_token') ?? '';
    }

    window.history.replaceState(null, '', window.location.pathname);
});

async function submit() {
    if (password.value !== passwordRepeat.value) {
        errorMessage.value = 'Hasła muszą być takie same.';

        return;
    }

    saving.value = true;
    errorMessage.value = '';

    try {
        await $fetch('/api/auth/password-recovery/complete', {
            method: 'POST',
            body: {
                accessToken: accessToken.value,
                refreshToken: refreshToken.value,
                password: password.value,
            },
        });
        changed.value = true;
        accessToken.value = '';
        refreshToken.value = '';
        password.value = '';
        passwordRepeat.value = '';
    } catch {
        errorMessage.value =
            'Nie udało się zmienić hasła. Link mógł wygasnąć; poproś o nowy.';
    } finally {
        saving.value = false;
    }
}
</script>

<template>
    <main
        class="bg-background flex min-h-screen items-center justify-center px-4 py-12"
    >
        <section
            class="border-border bg-card w-full max-w-md rounded-2xl border p-8 shadow-sm"
        >
            <p
                class="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase"
            >
                OSK Manager
            </p>
            <h1 class="text-foreground mt-3 text-2xl font-semibold">
                Ustaw nowe hasło
            </h1>
            <p
                v-if="changed"
                role="status"
                class="text-foreground mt-6 text-sm"
            >
                Hasło zostało zmienione. Zaloguj się ponownie.
            </p>
            <p
                v-else-if="!accessToken || !refreshToken"
                role="alert"
                class="text-destructive mt-6 text-sm"
            >
                Link jest nieprawidłowy lub wygasł.
            </p>
            <form v-else class="mt-6 space-y-4" @submit.prevent="submit">
                <div class="space-y-2">
                    <label
                        for="new-password"
                        class="text-foreground text-sm font-medium"
                        >Nowe hasło</label
                    >
                    <UiInput
                        id="new-password"
                        v-model="password"
                        type="password"
                        autocomplete="new-password"
                        minlength="8"
                        required
                    />
                </div>
                <div class="space-y-2">
                    <label
                        for="repeat-password"
                        class="text-foreground text-sm font-medium"
                        >Powtórz hasło</label
                    >
                    <UiInput
                        id="repeat-password"
                        v-model="passwordRepeat"
                        type="password"
                        autocomplete="new-password"
                        minlength="8"
                        required
                    />
                </div>
                <p
                    v-if="errorMessage"
                    role="alert"
                    class="text-destructive text-sm"
                >
                    {{ errorMessage }}
                </p>
                <UiButton class="w-full" type="submit" :disabled="saving">{{
                    saving ? 'Zapisywanie…' : 'Zmień hasło'
                }}</UiButton>
            </form>
            <NuxtLink
                :to="changed ? '/login' : '/forgot-password'"
                class="text-primary mt-6 inline-block text-sm font-medium underline-offset-4 hover:underline"
                >{{
                    changed ? 'Przejdź do logowania' : 'Poproś o nowy link'
                }}</NuxtLink
            >
        </section>
    </main>
</template>
