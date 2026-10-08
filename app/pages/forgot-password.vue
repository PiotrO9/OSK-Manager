<script setup lang="ts">
definePageMeta({ layout: false });
usePageMeta({
    title: () => 'Odzyskiwanie hasła',
    description: () => 'Wyślij link do zmiany hasła.',
});

const email = shallowRef('');
const sending = shallowRef(false);
const sent = shallowRef(false);
const errorMessage = shallowRef('');

async function submit() {
    sending.value = true;
    errorMessage.value = '';

    try {
        await $fetch('/api/auth/password-recovery/request', {
            method: 'POST',
            body: { email: email.value.trim() },
        });
        sent.value = true;
    } catch {
        errorMessage.value =
            'Nie udało się wysłać prośby. Spróbuj ponownie później.';
    } finally {
        sending.value = false;
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
                Odzyskaj dostęp
            </h1>
            <p class="text-muted-foreground mt-2 text-sm leading-6">
                Podaj adres e-mail konta. Jeśli istnieje, wyślemy link do zmiany
                hasła.
            </p>
            <p
                v-if="sent"
                role="status"
                class="border-border bg-muted text-foreground mt-6 rounded-lg border p-4 text-sm"
            >
                Sprawdź skrzynkę e-mail. Link może dotrzeć z opóźnieniem.
            </p>
            <form v-else class="mt-6 space-y-4" @submit.prevent="submit">
                <div class="space-y-2">
                    <label
                        for="recovery-email"
                        class="text-foreground text-sm font-medium"
                        >Adres e-mail</label
                    >
                    <UiInput
                        id="recovery-email"
                        v-model="email"
                        type="email"
                        autocomplete="email"
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
                <UiButton class="w-full" type="submit" :disabled="sending">{{
                    sending ? 'Wysyłanie…' : 'Wyślij link'
                }}</UiButton>
            </form>
            <NuxtLink
                to="/login"
                class="text-primary mt-6 inline-block text-sm font-medium underline-offset-4 hover:underline"
                >Wróć do logowania</NuxtLink
            >
        </section>
    </main>
</template>
