<script setup lang="ts">
definePageMeta({ layout: 'app-shell', middleware: ['manager'] });
usePageMeta({
    title: () => 'Konta użytkowników',
    description: () => 'Zarządzanie kontami osób przypisanych do Twojego OSK.',
});

const {
    schools,
    schoolId,
    selectedUserId,
    search,
    roleFilter,
    loading,
    busy,
    errorMessage,
    actionMessage,
    actionError,
    selectedAccount,
    filteredAccounts,
    loadAccounts,
    handleSchoolChange,
    runAction,
} = useManagerAccountsPage();

function accountPath() {
    return selectedAccount.value?.role === 'STUDENT'
        ? `/manager/students/${selectedAccount.value.id}`
        : selectedAccount.value?.instructorProfile?.id
          ? `/manager/instructors/${selectedAccount.value.instructorProfile.id}`
          : '';
}
</script>

<template>
    <div class="space-y-6">
        <PageHeader title="Konta użytkowników" eyebrow="Manager" />
        <section
            class="grid gap-5 lg:grid-cols-[minmax(260px,360px)_minmax(0,1fr)]"
        >
            <aside
                class="border-border bg-card space-y-4 rounded-xl border p-5 shadow-xs"
            >
                <SchoolContextSelect
                    id="accounts-school"
                    :schools="schools"
                    :model-value="schoolId"
                    @update:model-value="handleSchoolChange"
                />
                <div class="space-y-1.5">
                    <label for="account-search" class="text-sm font-medium"
                        >Szukaj osoby</label
                    ><UiInput
                        id="account-search"
                        v-model="search"
                        placeholder="Imię, nazwisko lub e-mail"
                    />
                </div>
                <div class="flex gap-2" aria-label="Filtr roli">
                    <UiButton
                        v-for="option in [
                            { value: 'ALL', label: 'Wszyscy' },
                            { value: 'STUDENT', label: 'Kursanci' },
                            { value: 'INSTRUCTOR', label: 'Instruktorzy' },
                        ] as const"
                        :key="option.value"
                        size="sm"
                        :variant="
                            roleFilter === option.value ? 'default' : 'outline'
                        "
                        @click="roleFilter = option.value"
                        >{{ option.label }}</UiButton
                    >
                </div>
                <p
                    v-if="errorMessage"
                    role="alert"
                    class="text-destructive text-sm"
                >
                    {{ errorMessage }}
                </p>
                <div
                    v-if="loading"
                    class="text-muted-foreground py-8 text-center text-sm"
                >
                    Wczytywanie kont…
                </div>
                <div
                    v-else-if="filteredAccounts.length === 0"
                    class="text-muted-foreground py-8 text-center text-sm"
                >
                    Brak osób w wybranym OSK.
                </div>
                <div
                    v-else
                    class="max-h-[60vh] space-y-1 overflow-y-auto"
                    aria-label="Osoby z wybranego ośrodka"
                >
                    <button
                        v-for="account in filteredAccounts"
                        :key="account.id"
                        type="button"
                        class="hover:bg-muted w-full rounded-lg border px-3 py-3 text-left transition-colors"
                        :class="
                            selectedUserId === account.id
                                ? 'border-primary bg-muted'
                                : 'border-transparent'
                        "
                        @click="selectedUserId = account.id"
                    >
                        <span class="block truncate text-sm font-semibold"
                            >{{ account.firstName }}
                            {{ account.lastName }}</span
                        >
                        <span
                            class="text-muted-foreground block truncate text-xs"
                            >{{
                                account.role === 'STUDENT'
                                    ? 'Kursant'
                                    : 'Instruktor'
                            }}
                            · {{ account.email }}</span
                        >
                        <span
                            v-if="account.deletedAt || !account.isActive"
                            class="text-muted-foreground mt-1 block text-xs font-medium"
                            >{{
                                account.deletedAt ? 'Archiwum' : 'Zablokowane'
                            }}</span
                        >
                    </button>
                </div>
                <UiButton
                    variant="ghost"
                    size="sm"
                    :disabled="loading"
                    @click="loadAccounts"
                    >Odśwież listę</UiButton
                >
            </aside>
            <div
                class="border-border bg-card min-h-72 rounded-xl border p-6 shadow-xs"
            >
                <ManagerAccountEditor
                    v-if="selectedAccount"
                    :account="selectedAccount"
                    :busy="busy"
                    :message="actionMessage"
                    :error="actionError"
                    @profile="
                        (body) =>
                            runAction(
                                '/profile',
                                'PATCH',
                                body,
                                'Dane zapisano.',
                            )
                    "
                    @email="
                        (body) =>
                            runAction(
                                '/email',
                                'PATCH',
                                body,
                                'Adres e-mail zmieniono. Możesz teraz wysłać reset hasła.',
                            )
                    "
                    @reset="
                        runAction(
                            '/password-reset',
                            'POST',
                            undefined,
                            'Link resetu został wysłany na zapisany e-mail.',
                        )
                    "
                    @status="
                        (isActive) =>
                            runAction(
                                '/status',
                                'PATCH',
                                { isActive },
                                isActive
                                    ? 'Konto odblokowano. Wymagane jest ponowne logowanie.'
                                    : 'Konto zablokowano.',
                            )
                    "
                    @archive="
                        runAction(
                            '/archive',
                            'POST',
                            undefined,
                            'Konto zarchiwizowano.',
                        )
                    "
                    @reconcile="
                        runAction(
                            '/email/reconcile',
                            'POST',
                            undefined,
                            'Synchronizacja została sprawdzona.',
                        )
                    "
                />
                <div
                    v-else
                    class="text-muted-foreground flex h-full min-h-60 items-center justify-center text-center text-sm"
                >
                    Wybierz osobę z listy, aby zarządzać jej kontem.
                </div>
                <NuxtLink
                    v-if="
                        selectedAccount &&
                        !selectedAccount.deletedAt &&
                        accountPath()
                    "
                    :to="accountPath()"
                    class="text-primary mt-5 inline-block text-sm font-medium underline-offset-4 hover:underline"
                    >Przejdź do szczegółów osoby</NuxtLink
                >
            </div>
        </section>
    </div>
</template>
