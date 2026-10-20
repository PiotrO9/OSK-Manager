<script setup lang="ts">
import type { ManagerAccountSummary } from '~/types/manager/account';

defineProps<{
    accounts: ManagerAccountSummary[];
    selectedUserId: string;
    search: string;
    roleFilter: 'ALL' | 'STUDENT' | 'INSTRUCTOR';
    currentPage: number;
    total: number;
    totalPages: number;
    loading: boolean;
    busy: boolean;
    errorMessage: string;
    hasSchool: boolean;
}>();
const emit = defineEmits<{
    'update:search': [value: string];
    'update:roleFilter': [value: 'ALL' | 'STUDENT' | 'INSTRUCTOR'];
    select: [userId: string];
    page: [page: number];
    refresh: [];
}>();
const roleOptions = [
    { value: 'ALL', label: 'Wszyscy' },
    { value: 'STUDENT', label: 'Kursanci' },
    { value: 'INSTRUCTOR', label: 'Instruktorzy' },
] as const;
</script>

<template>
    <div class="space-y-4">
        <div class="space-y-1.5">
            <label for="account-search" class="text-sm font-medium"
                >Szukaj osoby</label
            >
            <UiInput
                id="account-search"
                :model-value="search"
                :disabled="!hasSchool"
                :maxlength="120"
                placeholder="Imię, nazwisko lub e-mail"
                @update:model-value="emit('update:search', String($event))"
            />
        </div>
        <div class="flex flex-wrap gap-2" aria-label="Filtr roli">
            <UiButton
                v-for="option in roleOptions"
                :key="option.value"
                size="sm"
                :disabled="!hasSchool"
                :aria-pressed="roleFilter === option.value"
                :variant="roleFilter === option.value ? 'default' : 'outline'"
                @click="emit('update:roleFilter', option.value)"
                >{{ option.label }}</UiButton
            >
        </div>
        <p v-if="errorMessage" role="alert" class="text-destructive text-sm">
            {{ errorMessage }}
        </p>
        <div
            v-else-if="loading"
            role="status"
            class="text-muted-foreground py-8 text-center text-sm"
        >
            Wczytywanie kont…
        </div>
        <div
            v-else-if="!hasSchool"
            class="text-muted-foreground py-8 text-center text-sm"
        >
            Wybierz ośrodek, aby wyświetlić konta.
        </div>
        <div
            v-else-if="accounts.length === 0"
            role="status"
            class="text-muted-foreground py-8 text-center text-sm"
        >
            {{
                search.trim() || roleFilter !== 'ALL'
                    ? 'Brak kont pasujących do wyszukiwania.'
                    : 'Brak osób w wybranym OSK.'
            }}
        </div>
        <div
            v-else
            class="max-h-[60vh] space-y-1 overflow-y-auto"
            aria-label="Osoby z wybranego ośrodka"
        >
            <button
                v-for="account in accounts"
                :key="account.id"
                type="button"
                :disabled="busy"
                :aria-pressed="selectedUserId === account.id"
                class="hover:bg-muted w-full rounded-lg border px-3 py-3 text-left transition-colors disabled:opacity-60"
                :class="
                    selectedUserId === account.id
                        ? 'border-primary bg-muted'
                        : 'border-transparent'
                "
                @click="emit('select', account.id)"
            >
                <span class="block truncate text-sm font-semibold"
                    >{{ account.firstName }} {{ account.lastName }}</span
                >
                <span class="text-muted-foreground block truncate text-xs"
                    >{{
                        account.role === 'STUDENT' ? 'Kursant' : 'Instruktor'
                    }}
                    · {{ account.email }}</span
                >
                <span
                    v-if="account.deletedAt || !account.isActive"
                    class="text-muted-foreground mt-1 block text-xs font-medium"
                    >{{ account.deletedAt ? 'Archiwum' : 'Zablokowane' }}</span
                >
            </button>
        </div>
        <nav
            v-if="hasSchool && !loading && !errorMessage"
            aria-label="Strony listy kont"
            class="space-y-2"
        >
            <p
                class="text-muted-foreground text-sm tabular-nums"
                aria-live="polite"
            >
                Strona {{ currentPage }} z {{ totalPages }} · Konta: {{ total }}
            </p>
            <div v-if="totalPages > 1" class="flex gap-2">
                <UiButton
                    size="sm"
                    variant="outline"
                    :disabled="currentPage <= 1"
                    aria-label="Poprzednia strona listy kont"
                    @click="emit('page', currentPage - 1)"
                    >Poprzednia</UiButton
                >
                <UiButton
                    size="sm"
                    variant="outline"
                    :disabled="currentPage >= totalPages"
                    aria-label="Następna strona listy kont"
                    @click="emit('page', currentPage + 1)"
                    >Następna</UiButton
                >
            </div>
        </nav>
        <UiButton
            variant="ghost"
            size="sm"
            :disabled="loading || !hasSchool"
            @click="emit('refresh')"
            >Odśwież listę</UiButton
        >
    </div>
</template>
