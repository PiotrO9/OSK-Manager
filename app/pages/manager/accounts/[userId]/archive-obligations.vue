<script setup lang="ts">
definePageMeta({ layout: 'app-shell', middleware: ['manager'] });
usePageMeta({ title: () => 'Zobowiązania blokujące archiwizację' });

const {
    userId,
    schoolId,
    account,
    obligations,
    loading,
    errorMessage,
    loadObligations,
} = useManagerAccountObligationsPage();

const accountPath = computed(() => ({
    path: '/manager/accounts',
    query: { schoolId: schoolId.value, userId: userId.value },
}));
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            title="Zobowiązania blokujące archiwizację"
            eyebrow="Manager"
        />
        <NuxtLink
            :to="accountPath"
            class="text-primary text-sm font-medium underline underline-offset-4"
            >Wróć do konta</NuxtLink
        >
        <p v-if="account" class="text-muted-foreground text-sm">
            {{ account.firstName }} {{ account.lastName }} ·
            {{ account.role === 'STUDENT' ? 'Kursant' : 'Instruktor' }}
        </p>
        <div v-if="loading" role="status" class="text-muted-foreground">
            Wczytywanie zobowiązań…
        </div>
        <div v-else-if="errorMessage" role="alert" class="space-y-3">
            <p class="text-destructive">{{ errorMessage }}</p>
            <UiButton variant="outline" @click="loadObligations"
                >Spróbuj ponownie</UiButton
            >
        </div>
        <template v-else-if="account">
            <div class="flex flex-wrap items-center gap-3">
                <p class="text-sm">
                    Aktualnych blokad: <strong>{{ obligations.length }}</strong>
                </p>
                <UiButton variant="outline" size="sm" @click="loadObligations"
                    >Odśwież</UiButton
                >
            </div>
            <ManagerAccountObligationsList
                v-if="obligations.length"
                :account="account"
                :school-id="schoolId"
                :obligations="obligations"
            />
            <div v-else class="border-border bg-card rounded-xl border p-6">
                <p>Brak aktualnych zobowiązań blokujących archiwizację.</p>
                <p class="text-muted-foreground mt-2 text-sm">
                    Możesz wrócić do konta i ponowić próbę. Serwer sprawdzi
                    warunki ponownie.
                </p>
                <NuxtLink
                    :to="accountPath"
                    class="text-primary mt-3 inline-block font-semibold underline underline-offset-4"
                    >Wróć do konta</NuxtLink
                >
            </div>
        </template>
    </div>
</template>
