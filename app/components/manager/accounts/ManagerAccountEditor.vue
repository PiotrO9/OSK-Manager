<script setup lang="ts">
import type { ManagerAccount } from '~/types/manager/account';

const props = defineProps<{
    account: ManagerAccount;
    busy: boolean;
    message: string;
    error: string;
}>();
const emit = defineEmits<{
    profile: [
        body: { firstName: string; lastName: string; phone: string | null },
    ];
    email: [body: { email: string }];
    reset: [];
    status: [isActive: boolean];
    archive: [];
    reconcile: [];
}>();

const firstName = shallowRef('');
const lastName = shallowRef('');
const phone = shallowRef('');
const email = shallowRef('');
const pendingAction = shallowRef<'block' | 'archive' | 'email' | null>(null);
const pendingEmail = shallowRef('');

watch(
    () => props.account,
    (account) => {
        firstName.value = account.firstName;
        lastName.value = account.lastName;
        phone.value = account.phone ?? '';
        email.value = account.email;
        pendingAction.value = null;
        pendingEmail.value = '';
    },
    { immediate: true },
);

function confirmStatus() {
    if (props.account.isActive) {
        pendingAction.value = 'block';

        return;
    }

    emit('status', true);
}

function confirmArchive() {
    pendingAction.value = 'archive';
}

function confirmEmail() {
    const next = email.value.trim();

    if (!next) return;

    pendingEmail.value = next;
    pendingAction.value = 'email';
}

function applyConfirmedAction() {
    const action = pendingAction.value;

    pendingAction.value = null;

    if (action === 'block') emit('status', false);

    if (action === 'archive') emit('archive');

    if (action === 'email') emit('email', { email: pendingEmail.value });
}
</script>

<template>
    <section
        class="space-y-6"
        :aria-label="`Konto: ${account.firstName} ${account.lastName}`"
    >
        <header
            class="border-border flex flex-wrap items-start justify-between gap-4 border-b pb-5"
        >
            <div>
                <p
                    class="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase"
                >
                    {{ account.role === 'STUDENT' ? 'Kursant' : 'Instruktor' }}
                </p>
                <h2 class="text-foreground mt-1 text-xl font-semibold">
                    {{ account.firstName }} {{ account.lastName }}
                </h2>
                <p class="text-muted-foreground mt-1 text-sm">
                    {{ account.email }}
                </p>
            </div>
            <span
                class="border-border bg-muted text-foreground rounded-full border px-3 py-1 text-xs font-semibold"
                >{{
                    account.deletedAt
                        ? 'Zarchiwizowane'
                        : account.isActive
                          ? 'Aktywne'
                          : 'Zablokowane'
                }}</span
            >
        </header>

        <p
            v-if="message"
            role="status"
            class="border-border bg-muted rounded-lg border p-3 text-sm"
        >
            {{ message }}
        </p>
        <p
            v-if="error"
            role="alert"
            class="border-destructive/40 text-destructive rounded-lg border p-3 text-sm"
        >
            {{ error }}
        </p>

        <form
            v-if="!account.deletedAt"
            class="grid gap-4 sm:grid-cols-2"
            @submit.prevent="
                emit('profile', {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone.trim() || null,
                })
            "
        >
            <h3 class="text-foreground text-sm font-semibold sm:col-span-2">
                Dane podstawowe
            </h3>
            <div class="space-y-1.5">
                <label for="account-first-name" class="text-sm">Imię</label
                ><UiInput
                    id="account-first-name"
                    v-model="firstName"
                    maxlength="100"
                    required
                />
            </div>
            <div class="space-y-1.5">
                <label for="account-last-name" class="text-sm">Nazwisko</label
                ><UiInput
                    id="account-last-name"
                    v-model="lastName"
                    maxlength="100"
                    required
                />
            </div>
            <div class="space-y-1.5 sm:col-span-2">
                <label for="account-phone" class="text-sm">Telefon</label
                ><UiInput
                    id="account-phone"
                    v-model="phone"
                    type="tel"
                    maxlength="40"
                />
            </div>
            <div class="sm:col-span-2">
                <UiButton type="submit" :disabled="busy">Zapisz dane</UiButton>
            </div>
        </form>

        <div
            v-if="!account.deletedAt"
            class="border-border space-y-4 border-t pt-5"
        >
            <div>
                <h3 class="text-foreground text-sm font-semibold">
                    Dostęp i e-mail
                </h3>
                <p class="text-muted-foreground mt-1 text-sm">
                    Zmiana e-maila jest natychmiastowa. Link resetu hasła
                    wysyłany jest osobną akcją na zapisany adres.
                </p>
            </div>
            <div class="flex flex-wrap items-end gap-3">
                <div class="min-w-56 flex-1 space-y-1.5">
                    <label for="account-email" class="text-sm"
                        >Adres e-mail</label
                    ><UiInput
                        id="account-email"
                        v-model="email"
                        type="email"
                        maxlength="320"
                    />
                </div>
                <UiButton
                    variant="outline"
                    :disabled="
                        busy ||
                        email.trim().toLowerCase() ===
                            account.email.toLowerCase()
                    "
                    @click="confirmEmail"
                    >Zmień e-mail</UiButton
                >
            </div>
            <div class="flex flex-wrap gap-2">
                <UiButton
                    variant="outline"
                    :disabled="busy || !account.isActive"
                    @click="emit('reset')"
                    >Wyślij reset hasła</UiButton
                >
                <UiButton
                    variant="outline"
                    :disabled="busy"
                    @click="confirmStatus"
                    >{{
                        account.isActive ? 'Zablokuj konto' : 'Odblokuj konto'
                    }}</UiButton
                >
                <UiButton
                    variant="outline"
                    :disabled="busy"
                    @click="confirmArchive"
                    >Archiwizuj</UiButton
                >
            </div>
            <p
                v-if="account.accountActionsFor?.length"
                class="text-muted-foreground text-xs"
            >
                Zmiana e-maila wymaga synchronizacji z kontem.
            </p>
            <UiButton
                v-if="account.accountActionsFor?.length"
                variant="ghost"
                size="sm"
                :disabled="busy"
                @click="emit('reconcile')"
                >Ponów synchronizację e-maila</UiButton
            >
        </div>
        <ManagerAccountActionDialog
            :action="pendingAction"
            :account-name="`${account.firstName} ${account.lastName}`"
            :new-email="pendingEmail"
            @cancel="pendingAction = null"
            @confirm="applyConfirmedAction"
        />
    </section>
</template>
