<script setup lang="ts">
import { appPaths } from '~~/shared/routing/appPaths';
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
    archiveObligationsUserId,
    selectedAccount,
    accounts,
    currentPage,
    total,
    totalPages,
    detailLoading,
    detailError,
    retrySelectedAccount,
    selectAccount,
    changePage,
    loadAccounts,
    handleSchoolChange,
    runAction,
} = useManagerAccountsPage();

function accountPath() {
    return selectedAccount.value?.role === 'STUDENT'
        ? appPaths.managerStudent(selectedAccount.value.id)
        : selectedAccount.value?.instructorProfile?.id
          ? appPaths.managerInstructor(
                selectedAccount.value.instructorProfile.id,
            )
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
                    :disabled="busy"
                    @update:model-value="handleSchoolChange"
                />
                <ManagerAccountsList
                    v-model:search="search"
                    v-model:role-filter="roleFilter"
                    :accounts="accounts"
                    :selected-user-id="selectedUserId"
                    :current-page="currentPage"
                    :total="total"
                    :total-pages="totalPages"
                    :loading="loading"
                    :busy="busy"
                    :error-message="errorMessage"
                    :has-school="Boolean(schoolId)"
                    @select="selectAccount"
                    @page="changePage"
                    @refresh="loadAccounts"
                />
            </aside>
            <div
                class="border-border bg-card min-h-72 rounded-xl border p-6 shadow-xs"
            >
                <p
                    v-if="detailLoading"
                    role="status"
                    class="text-muted-foreground text-sm"
                >
                    Wczytywanie danych konta…
                </p>
                <div v-else-if="detailError" class="space-y-3">
                    <p role="alert" class="text-destructive text-sm">
                        {{ detailError }}
                    </p>
                    <UiButton
                        variant="outline"
                        size="sm"
                        @click="retrySelectedAccount"
                        >Spróbuj ponownie</UiButton
                    >
                </div>
                <ManagerAccountEditor
                    v-else-if="selectedAccount"
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
                <div
                    v-if="
                        selectedAccount &&
                        archiveObligationsUserId === selectedAccount.id
                    "
                    role="alert"
                    class="border-border bg-muted mt-5 rounded-lg border p-4 text-sm"
                >
                    <p>
                        Konto ma aktywne zobowiązania. Sprawdź, co blokuje
                        archiwizację.
                    </p>
                    <NuxtLink
                        :to="{
                            path: appPaths.managerAccountObligations(
                                selectedAccount.id,
                            ),
                        }"
                        class="text-primary mt-2 inline-block font-semibold underline underline-offset-4"
                        >Pokaż zobowiązania</NuxtLink
                    >
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
                <NuxtLink
                    v-if="selectedAccount && !selectedAccount.deletedAt"
                    :to="{
                        path: appPaths.managerAccountObligations(
                            selectedAccount.id,
                        ),
                    }"
                    class="text-primary mt-3 block text-sm font-medium underline-offset-4 hover:underline"
                    >Sprawdź zobowiązania konta</NuxtLink
                >
            </div>
        </section>
    </div>
</template>
